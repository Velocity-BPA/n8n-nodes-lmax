/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	IDataObject,
} from 'n8n-workflow';

interface LmaxTriggerSession {
	sessionId: string;
	accountId: string;
	expiresAt: number;
}

interface LmaxTriggerEvent {
	type: string;
	data: IDataObject;
	[key: string]: unknown;
}

const triggerSessionCache: Map<string, LmaxTriggerSession> = new Map();

export class LmaxTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LMAX Trigger',
		name: 'lmaxTrigger',
		icon: 'file:lmax.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["eventTypes"].join(", ")}}',
		description: 'Triggers workflow on LMAX events (order book, executions, positions, etc.)',
		defaults: {
			name: 'LMAX Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'lmaxApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Event Types',
				name: 'eventTypes',
				type: 'multiOptions',
				options: [
					{
						name: 'Account State',
						value: 'accountStateEvent',
						description: 'Account balance and margin updates',
					},
					{
						name: 'Execution',
						value: 'executionEvent',
						description: 'Trade executions (fills)',
					},
					{
						name: 'Heartbeat',
						value: 'heartbeatEvent',
						description: 'Session keepalive confirmations',
					},
					{
						name: 'Instruction Rejected',
						value: 'instructionRejectedEvent',
						description: 'Order rejection notifications',
					},
					{
						name: 'Order',
						value: 'orderEvent',
						description: 'Order status changes',
					},
					{
						name: 'Order Book',
						value: 'orderBookEvent',
						description: 'Market data price changes',
					},
					{
						name: 'Position',
						value: 'positionEvent',
						description: 'Position updates',
					},
				],
				default: ['executionEvent', 'orderEvent', 'positionEvent'],
				required: true,
				description: 'Event types to listen for',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Instrument IDs',
						name: 'instrumentIds',
						type: 'string',
						default: '',
						description:
							'Comma-separated list of instrument IDs to filter events (empty for all)',
					},
					{
						displayName: 'Poll Timeout (Ms)',
						name: 'pollTimeout',
						type: 'number',
						default: 30000,
						description: 'Long-poll timeout in milliseconds',
					},
					{
						displayName: 'Heartbeat Interval (Ms)',
						name: 'heartbeatInterval',
						type: 'number',
						default: 300000,
						description:
							'Interval to send heartbeat to keep session alive (default 5 minutes)',
					},
					{
						displayName: 'Auto Subscribe',
						name: 'autoSubscribe',
						type: 'boolean',
						default: true,
						description:
							'Whether to automatically subscribe to events when trigger starts',
					},
				],
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const eventTypes = this.getNodeParameter('eventTypes') as string[];
		const options = this.getNodeParameter('options', {}) as {
			instrumentIds?: string;
			pollTimeout?: number;
			heartbeatInterval?: number;
			autoSubscribe?: boolean;
		};

		const pollTimeout = options.pollTimeout ?? 30000;
		const heartbeatInterval = options.heartbeatInterval ?? 300000;
		const autoSubscribe = options.autoSubscribe ?? true;

		// Log licensing notice
		this.logger.warn(
			'[Velocity BPA Licensing Notice] This n8n node is licensed under BSL 1.1. ' +
				'Use by for-profit organizations in production requires a commercial license. ' +
				'Visit https://velobpa.com/licensing for details.',
		);

		let isRunning = true;
		let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

		const credentials = await this.getCredentials('lmaxApi');
		const baseUrl =
			credentials.environment === 'live'
				? 'https://trade.lmaxtrader.com'
				: 'https://testapi.lmaxtrader.com';

		// Get or create session
		const getOrCreateSession = async (): Promise<LmaxTriggerSession> => {
			const cacheKey = `${credentials.username}:${credentials.environment}`;
			const cached = triggerSessionCache.get(cacheKey);

			if (cached && cached.expiresAt > Date.now()) {
				return cached;
			}

			const response = await this.helpers.httpRequest({
				method: 'POST',
				url: `${baseUrl}/public/security/login`,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					Accept: 'application/xml',
				},
				body: `username=${encodeURIComponent(String(credentials.username))}&password=${encodeURIComponent(String(credentials.password))}&productType=${encodeURIComponent(String(credentials.productType))}`,
				returnFullResponse: true,
			});

			const cookies = response.headers['set-cookie'] as string[] | string | undefined;
			let sessionId = '';

			if (Array.isArray(cookies)) {
				for (const cookie of cookies) {
					if (cookie.includes('JSESSIONID=')) {
						const match = cookie.match(/JSESSIONID=([^;]+)/);
						if (match) {
							sessionId = match[1];
							break;
						}
					}
				}
			} else if (typeof cookies === 'string' && cookies.includes('JSESSIONID=')) {
				const match = cookies.match(/JSESSIONID=([^;]+)/);
				if (match) {
					sessionId = match[1];
				}
			}

			if (!sessionId) {
				throw new Error('Failed to extract session ID from login response');
			}

			const body = String(response.body);
			const accountIdMatch = body.match(/<accountId>(\d+)<\/accountId>/);
			const accountId = accountIdMatch ? accountIdMatch[1] : '';

			const session: LmaxTriggerSession = {
				sessionId,
				accountId,
				expiresAt: Date.now() + 25 * 60 * 1000,
			};

			triggerSessionCache.set(cacheKey, session);
			return session;
		};

		// Establish session
		const session = await getOrCreateSession();

		// Auto-subscribe to events if enabled
		if (autoSubscribe) {
			const subscribeEndpoints: string[] = [];

			if (eventTypes.includes('orderBookEvent')) {
				subscribeEndpoints.push('/secure/marketdata/subscribe');
			}
			if (eventTypes.includes('executionEvent')) {
				subscribeEndpoints.push('/secure/execution/subscribe');
			}
			if (eventTypes.includes('orderEvent')) {
				subscribeEndpoints.push('/secure/order/subscribe');
			}
			if (eventTypes.includes('positionEvent')) {
				subscribeEndpoints.push('/secure/position/subscribe');
			}
			if (eventTypes.includes('accountStateEvent')) {
				subscribeEndpoints.push('/secure/account/subscribe');
			}

			for (const endpoint of subscribeEndpoints) {
				try {
					await this.helpers.httpRequest({
						method: 'POST',
						url: `${baseUrl}${endpoint}`,
						headers: {
							Accept: 'application/xml',
							'Content-Type': 'application/xml',
							Cookie: `JSESSIONID=${session.sessionId}`,
						},
					});
				} catch (error) {
					this.logger.warn(`Failed to subscribe to ${endpoint}: ${(error as Error).message}`);
				}
			}
		}

		// Heartbeat function
		const sendHeartbeat = async (): Promise<void> => {
			const currentSession = await getOrCreateSession();
			await this.helpers.httpRequest({
				method: 'POST',
				url: `${baseUrl}/secure/session/heartbeat`,
				headers: {
					Accept: 'application/xml',
					Cookie: `JSESSIONID=${currentSession.sessionId}`,
				},
			});
		};

		// Start heartbeat timer
		heartbeatTimer = setInterval(async () => {
			try {
				await sendHeartbeat();
			} catch (error) {
				this.logger.error(`LMAX heartbeat failed: ${(error as Error).message}`);
			}
		}, heartbeatInterval);

		// Parse events from XML response
		const parseEvents = (xmlBody: string): LmaxTriggerEvent[] => {
			const events: LmaxTriggerEvent[] = [];
			const eventTypesInXml = [
				'orderBookEvent',
				'executionEvent',
				'orderEvent',
				'positionEvent',
				'accountStateEvent',
				'instructionRejectedEvent',
				'heartbeatEvent',
			];

			for (const eventType of eventTypesInXml) {
				const regex = new RegExp(`<${eventType}>([\\s\\S]*?)</${eventType}>`, 'g');
				let match;
				while ((match = regex.exec(xmlBody)) !== null) {
					const eventData: IDataObject = {};
					const innerXml = match[1];

					// Extract common fields
					const fields = [
						'instrumentId',
						'accountId',
						'orderId',
						'instructionId',
						'quantity',
						'price',
						'timestamp',
					];
					for (const field of fields) {
						const fieldMatch = innerXml.match(
							new RegExp(`<${field}>([^<]*)</${field}>`),
						);
						if (fieldMatch) {
							eventData[field] = fieldMatch[1];
						}
					}

					events.push({
						type: eventType,
						data: eventData,
					});
				}
			}

			return events;
		};

		// Polling function
		const poll = async (): Promise<void> => {
			while (isRunning) {
				try {
					const currentSession = await getOrCreateSession();
					const response = await this.helpers.httpRequest({
						method: 'GET',
						url: `${baseUrl}/secure/read`,
						headers: {
							Accept: 'application/xml',
							Cookie: `JSESSIONID=${currentSession.sessionId}`,
						},
						timeout: pollTimeout,
					});

					const events = parseEvents(String(response));

					// Filter events by type
					const filteredEvents = events.filter((event) =>
						eventTypes.includes(event.type),
					);

					// Filter by instrument IDs if specified
					let finalEvents = filteredEvents;
					if (options.instrumentIds) {
						const instrumentIds = options.instrumentIds.split(',').map((id) => id.trim());
						finalEvents = filteredEvents.filter((event) => {
							const instrumentId = event.data.instrumentId as string | undefined;
							return !instrumentId || instrumentIds.includes(String(instrumentId));
						});
					}

					// Emit events
					for (const event of finalEvents) {
						this.emit([this.helpers.returnJsonArray([event as IDataObject])]);
					}
				} catch (error) {
					if (isRunning) {
						const errorMessage = (error as Error).message;
						// Don't log timeout errors as they're expected with long polling
						if (!errorMessage.includes('ETIMEDOUT') && !errorMessage.includes('timeout')) {
							this.logger.error(`LMAX poll error: ${errorMessage}`);
						}
						// Wait before retrying on non-timeout errors
						if (!errorMessage.includes('timeout')) {
							await new Promise((resolve) => setTimeout(resolve, 5000));
						}
					}
				}
			}
		};

		// Start polling
		void poll();

		// Cleanup function
		const closeFunction = async (): Promise<void> => {
			isRunning = false;
			if (heartbeatTimer) {
				clearInterval(heartbeatTimer);
				heartbeatTimer = null;
			}
		};

		return {
			closeFunction,
		};
	}
}

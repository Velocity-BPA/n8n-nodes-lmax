/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { lmaxApiRequest } from '../../transport/LmaxClient';

export const description: INodeProperties[] = [
	{
		displayName: 'Event Types',
		name: 'eventTypes',
		type: 'multiOptions',
		options: [
			{ name: 'Account State', value: 'accountState' },
			{ name: 'Execution', value: 'execution' },
			{ name: 'Order', value: 'order' },
			{ name: 'Order Book', value: 'orderBook' },
			{ name: 'Position', value: 'position' },
			{ name: 'Rejection', value: 'rejection' },
		],
		default: [],
		required: true,
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['subscribe'],
			},
		},
		description: 'Event types to subscribe to',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['subscribe'],
			},
		},
		options: [
			{
				displayName: 'Instrument IDs',
				name: 'instrumentIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of instrument IDs for order book subscriptions',
			},
		],
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const eventTypes = this.getNodeParameter('eventTypes', index) as string[];
	const options = this.getNodeParameter('options', index, {}) as {
		instrumentIds?: string;
	};

	const results: Array<{ type: string; success: boolean; message: string }> = [];

	for (const eventType of eventTypes) {
		let endpoint = '';
		let body: Record<string, unknown> = {};

		switch (eventType) {
			case 'accountState':
				endpoint = '/secure/account/subscribe';
				body = { accountStateSubscriptionRequest: {} };
				break;
			case 'execution':
				endpoint = '/secure/execution/subscribe';
				body = { executionSubscriptionRequest: {} };
				break;
			case 'order':
				endpoint = '/secure/order/subscribe';
				body = { orderSubscriptionRequest: {} };
				break;
			case 'orderBook':
				endpoint = '/secure/marketdata/subscribe';
				const instrumentIds = options.instrumentIds
					? options.instrumentIds.split(',').map((id) => id.trim())
					: [];
				body = {
					orderBookSubscriptionRequest: {
						instrumentIds: instrumentIds.map((id) => ({ instrumentId: id })),
					},
				};
				break;
			case 'position':
				endpoint = '/secure/position/subscribe';
				body = { positionSubscriptionRequest: {} };
				break;
			case 'rejection':
				endpoint = '/secure/rejection/subscribe';
				body = { rejectionSubscriptionRequest: {} };
				break;
		}

		try {
			await lmaxApiRequest<Record<string, unknown>>(this, 'POST', endpoint, body);
			results.push({
				type: eventType,
				success: true,
				message: `Subscribed to ${eventType} events`,
			});
		} catch (error) {
			results.push({
				type: eventType,
				success: false,
				message: `Failed to subscribe to ${eventType}: ${(error as Error).message}`,
			});
		}
	}

	return [
		{
			json: {
				subscriptions: results,
				successCount: results.filter((r) => r.success).length,
				failureCount: results.filter((r) => !r.success).length,
			},
			pairedItem: { item: index },
		},
	];
}

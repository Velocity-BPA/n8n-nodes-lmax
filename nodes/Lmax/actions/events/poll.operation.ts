/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { lmaxPollEvents } from '../../transport/LmaxClient';
import type { LmaxEvent } from '../../types/LmaxTypes';

export const description: INodeProperties[] = [
	{
		displayName: 'Timeout',
		name: 'timeout',
		type: 'number',
		default: 30000,
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['poll'],
			},
		},
		description: 'Long-poll timeout in milliseconds (default 30000)',
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
				operation: ['poll'],
			},
		},
		options: [
			{
				displayName: 'Event Types',
				name: 'eventTypes',
				type: 'multiOptions',
				options: [
					{ name: 'Account State', value: 'accountStateEvent' },
					{ name: 'Execution', value: 'executionEvent' },
					{ name: 'Heartbeat', value: 'heartbeatEvent' },
					{ name: 'Instruction Rejected', value: 'instructionRejectedEvent' },
					{ name: 'Order', value: 'orderEvent' },
					{ name: 'Order Book', value: 'orderBookEvent' },
					{ name: 'Position', value: 'positionEvent' },
				],
				default: [],
				description: 'Filter by event types (empty for all)',
			},
			{
				displayName: 'Instrument IDs',
				name: 'instrumentIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of instrument IDs to filter events',
			},
		],
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const timeout = this.getNodeParameter('timeout', index) as number;
	const options = this.getNodeParameter('options', index, {}) as {
		eventTypes?: string[];
		instrumentIds?: string;
	};

	const rawEvents = await lmaxPollEvents(this, timeout);
	const events = rawEvents as LmaxEvent[];

	let filteredEvents = events;

	// Filter by event types if specified
	if (options.eventTypes && options.eventTypes.length > 0) {
		filteredEvents = filteredEvents.filter((event) =>
			options.eventTypes!.includes(event.type),
		);
	}

	// Filter by instrument IDs if specified
	if (options.instrumentIds) {
		const instrumentIds = options.instrumentIds.split(',').map((id) => id.trim());
		filteredEvents = filteredEvents.filter((event) => {
			const eventData = event.data as Record<string, unknown>;
			const instrumentId = eventData.instrumentId as string | undefined;
			return !instrumentId || instrumentIds.includes(String(instrumentId));
		});
	}

	if (filteredEvents.length === 0) {
		return [
			{
				json: {
					events: [],
					count: 0,
					message: 'No events received during poll interval',
				},
				pairedItem: { item: index },
			},
		];
	}

	return filteredEvents.map((event) => ({
		json: { ...event } as IDataObject,
		pairedItem: { item: index },
	}));
}

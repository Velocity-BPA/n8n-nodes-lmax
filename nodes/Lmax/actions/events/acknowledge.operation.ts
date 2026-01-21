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
		displayName: 'Event IDs',
		name: 'eventIds',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['events'],
				operation: ['acknowledge'],
			},
		},
		description: 'Comma-separated list of event IDs to acknowledge',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const eventIdsInput = this.getNodeParameter('eventIds', index) as string;
	const eventIds = eventIdsInput.split(',').map((id) => id.trim());

	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'POST',
		'/secure/event/acknowledge',
		{
			eventAcknowledgement: {
				eventIds: eventIds.map((id) => ({ eventId: id })),
			},
		},
	);

	return [
		{
			json: {
				acknowledged: true,
				eventIds,
				count: eventIds.length,
				response: response.data || {},
			},
			pairedItem: { item: index },
		},
	];
}

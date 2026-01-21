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
		displayName: 'Info',
		name: 'subscribeInfo',
		type: 'notice',
		default: '',
		displayOptions: {
			show: {
				resource: ['executions'],
				operation: ['subscribe'],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-param-description-unneeded-backticks
		description: `Subscribing to executions enables you to receive real-time execution events via the events polling mechanism. Use the Events resource to poll for execution updates.`,
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'POST',
		'/secure/execution/subscribe',
		{
			executionSubscriptionRequest: {},
		},
	);

	return [
		{
			json: {
				success: true,
				subscribed: true,
				message: 'Successfully subscribed to execution updates',
				response: response.data || {},
			},
			pairedItem: { item: index },
		},
	];
}

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
				resource: ['rejections'],
				operation: ['subscribe'],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-param-description-unneeded-backticks
		description: `Subscribing to rejections enables you to receive real-time rejection events. Use the Events resource to poll for rejection notifications.`,
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'POST',
		'/secure/rejection/subscribe',
		{
			rejectionSubscriptionRequest: {},
		},
	);

	return [
		{
			json: {
				success: true,
				subscribed: true,
				message: 'Successfully subscribed to rejection events',
				response: response.data || {},
			},
			pairedItem: { item: index },
		},
	];
}

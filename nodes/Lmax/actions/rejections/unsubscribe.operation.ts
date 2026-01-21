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
		name: 'unsubscribeInfo',
		type: 'notice',
		default: '',
		displayOptions: {
			show: {
				resource: ['rejections'],
				operation: ['unsubscribe'],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-param-description-unneeded-backticks
		description: `Unsubscribing from rejections stops real-time rejection event delivery.`,
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'POST',
		'/secure/rejection/unsubscribe',
		{
			rejectionUnsubscriptionRequest: {},
		},
	);

	return [
		{
			json: {
				success: true,
				subscribed: false,
				message: 'Successfully unsubscribed from rejection events',
				response: response.data || {},
			},
			pairedItem: { item: index },
		},
	];
}

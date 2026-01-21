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
		displayName: 'Instrument ID',
		name: 'instrumentId',
		type: 'number',
		default: 4001,
		required: true,
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['subscribeOrderBook'],
			},
		},
		description: 'Instrument ID to subscribe to',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const instrumentId = this.getNodeParameter('instrumentId', index) as number;

	await lmaxApiRequest(this, 'POST', '/secure/orderBook/subscribe', {
		subscribeRequest: {
			instrumentId,
		},
	});

	return [
		{
			json: {
				success: true,
				instrumentId,
				subscription: 'orderBook',
				message: `Subscribed to order book updates for instrument ${instrumentId}`,
			},
			pairedItem: { item: index },
		},
	];
}

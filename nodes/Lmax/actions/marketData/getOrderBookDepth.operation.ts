/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { lmaxApiRequest } from '../../transport/LmaxClient';
import { extractResponseData, ensureArray } from '../../utils/xmlUtils';

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
				operation: ['getOrderBookDepth'],
			},
		},
		description: 'Instrument ID to get order book depth for',
	},
	{
		displayName: 'Depth',
		name: 'depth',
		type: 'number',
		default: 5,
		typeOptions: {
			minValue: 1,
			maxValue: 10,
		},
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['getOrderBookDepth'],
			},
		},
		description: 'Order book depth (1-10 levels)',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const instrumentId = this.getNodeParameter('instrumentId', index) as number;
	const depth = this.getNodeParameter('depth', index) as number;

	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'POST',
		'/secure/orderBook/depth',
		{
			orderBookDepthRequest: {
				instrumentId,
				depth,
			},
		},
	);

	const orderBook = extractResponseData<Record<string, unknown>>(
		response.data || {},
		'orderBook',
		'orderBookDepth',
	);

	const bids = ensureArray(
		extractResponseData<unknown[]>(orderBook || {}, 'bids.bid', 'bid'),
	);
	const asks = ensureArray(
		extractResponseData<unknown[]>(orderBook || {}, 'asks.ask', 'ask'),
	);

	return [
		{
			json: {
				instrumentId,
				depth,
				bids,
				asks,
				timestamp: new Date().toISOString(),
			},
			pairedItem: { item: index },
		},
	];
}

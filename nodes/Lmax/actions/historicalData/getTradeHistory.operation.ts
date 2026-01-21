/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { lmaxApiRequest, generateInstructionId } from '../../transport/LmaxClient';
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
				resource: ['historicalData'],
				operation: ['getTradeHistory'],
			},
		},
		description: 'Instrument ID to get trade history for (e.g., 4001 for EUR/USD)',
	},
	{
		displayName: 'From',
		name: 'from',
		type: 'dateTime',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['historicalData'],
				operation: ['getTradeHistory'],
			},
		},
		description: 'Start timestamp (ISO 8601)',
	},
	{
		displayName: 'To',
		name: 'to',
		type: 'dateTime',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['historicalData'],
				operation: ['getTradeHistory'],
			},
		},
		description: 'End timestamp (ISO 8601)',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['historicalData'],
				operation: ['getTradeHistory'],
			},
		},
		options: [
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 100,
				description: 'Maximum number of trade records to return',
			},
		],
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const instrumentId = this.getNodeParameter('instrumentId', index) as number;
	const from = this.getNodeParameter('from', index) as string;
	const to = this.getNodeParameter('to', index) as string;
	const options = this.getNodeParameter('options', index, {}) as { limit?: number };
	const instructionId = generateInstructionId();

	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'POST',
		'/secure/marketdata/requestHistoricTrades',
		{
			historicTradesRequest: {
				instructionId,
				instrumentId,
				from: new Date(from).toISOString(),
				to: new Date(to).toISOString(),
				...(options.limit && { limit: options.limit }),
			},
		},
	);

	let trades = extractResponseData<unknown[]>(
		response.data || {},
		'historicTrades.trades',
		'trade',
	);

	trades = ensureArray(trades);

	return [
		{
			json: {
				instrumentId,
				from,
				to,
				count: trades.length,
				trades,
			},
			pairedItem: { item: index },
		},
	];
}

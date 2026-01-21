/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { lmaxApiRequest, generateInstructionId } from '../../transport/LmaxClient';
import { extractResponseData, ensureArray } from '../../utils/xmlUtils';
import type { LmaxHistoricalDataPoint, LmaxResolution } from '../../types/LmaxTypes';

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
				operation: ['getAggregateHistory'],
			},
		},
		description: 'Instrument ID to get historical data for',
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
				operation: ['getAggregateHistory'],
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
				operation: ['getAggregateHistory'],
			},
		},
		description: 'End timestamp (ISO 8601)',
	},
	{
		displayName: 'Resolution',
		name: 'resolution',
		type: 'options',
		options: [
			{ name: 'Minute', value: 'MINUTE' },
			{ name: 'Day', value: 'DAY' },
		],
		default: 'MINUTE',
		displayOptions: {
			show: {
				resource: ['historicalData'],
				operation: ['getAggregateHistory'],
			},
		},
		description: 'Data resolution',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const instrumentId = this.getNodeParameter('instrumentId', index) as number;
	const from = this.getNodeParameter('from', index) as string;
	const to = this.getNodeParameter('to', index) as string;
	const resolution = this.getNodeParameter('resolution', index) as LmaxResolution;
	const instructionId = generateInstructionId();

	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'POST',
		'/secure/marketdata/requestAggregateHistoricMarketData',
		{
			aggregateHistoricRequest: {
				instructionId,
				instrumentId,
				from: new Date(from).toISOString(),
				to: new Date(to).toISOString(),
				resolution,
			},
		},
	);

	let data = extractResponseData<LmaxHistoricalDataPoint[]>(
		response.data || {},
		'historicMarketData.data',
		'data',
	);

	data = ensureArray(data);

	return [
		{
			json: {
				instrumentId,
				from,
				to,
				resolution,
				count: data.length,
				data,
			},
			pairedItem: { item: index },
		},
	];
}

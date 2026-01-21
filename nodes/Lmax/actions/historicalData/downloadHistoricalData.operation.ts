/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { lmaxApiRequest, generateInstructionId } from '../../transport/LmaxClient';
import type { LmaxResolution } from '../../types/LmaxTypes';

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
				operation: ['downloadHistoricalData'],
			},
		},
		description: 'Instrument ID to download historical data for (e.g., 4001 for EUR/USD)',
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
				operation: ['downloadHistoricalData'],
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
				operation: ['downloadHistoricalData'],
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
				operation: ['downloadHistoricalData'],
			},
		},
		description: 'Data resolution',
	},
	{
		displayName: 'Data Type',
		name: 'dataType',
		type: 'options',
		options: [
			{ name: 'Aggregate (OHLCV)', value: 'aggregate' },
			{ name: 'Top of Book', value: 'topOfBook' },
		],
		default: 'aggregate',
		displayOptions: {
			show: {
				resource: ['historicalData'],
				operation: ['downloadHistoricalData'],
			},
		},
		description: 'Type of historical data to download',
	},
	{
		displayName: 'Format',
		name: 'format',
		type: 'options',
		options: [
			{ name: 'CSV', value: 'csv' },
			{ name: 'JSON', value: 'json' },
		],
		default: 'csv',
		displayOptions: {
			show: {
				resource: ['historicalData'],
				operation: ['downloadHistoricalData'],
			},
		},
		description: 'Output format',
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
	const dataType = this.getNodeParameter('dataType', index) as string;
	const format = this.getNodeParameter('format', index) as string;
	const instructionId = generateInstructionId();

	const endpoint = dataType === 'aggregate'
		? '/secure/marketdata/requestAggregateHistoricMarketData'
		: '/secure/marketdata/requestHistoricMarketData';

	const requestBody = dataType === 'aggregate'
		? {
			aggregateHistoricRequest: {
				instructionId,
				instrumentId,
				from: new Date(from).toISOString(),
				to: new Date(to).toISOString(),
				resolution,
				format: format.toUpperCase(),
			},
		}
		: {
			historicMarketDataRequest: {
				instructionId,
				instrumentId,
				from: new Date(from).toISOString(),
				to: new Date(to).toISOString(),
				format: format.toUpperCase(),
			},
		};

	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'POST',
		endpoint,
		requestBody,
	);

	const responseData = response.data || {};

	if (format === 'csv') {
		const csvData = (responseData as Record<string, unknown>).csvData ||
			(responseData as Record<string, unknown>).data ||
			'';

		return [
			{
				json: {
					instrumentId,
					from,
					to,
					resolution,
					dataType,
					format,
				},
				binary: {
					data: await this.helpers.prepareBinaryData(
						Buffer.from(csvData as string, 'utf-8'),
						`lmax_${instrumentId}_${dataType}_${resolution.toLowerCase()}.csv`,
						'text/csv',
					),
				},
				pairedItem: { item: index },
			},
		];
	}

	return [
		{
			json: {
				instrumentId,
				from,
				to,
				resolution,
				dataType,
				format,
				data: responseData,
			},
			pairedItem: { item: index },
		},
	];
}

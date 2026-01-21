/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { lmaxApiRequest } from '../../transport/LmaxClient';
import { extractResponseData, ensureArray } from '../../utils/xmlUtils';
import type { LmaxInstrument } from '../../types/LmaxTypes';

export const description: INodeProperties[] = [
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['instruments'],
				operation: ['search'],
			},
		},
		description: 'Search query string (instrument name or partial name)',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['instruments'],
				operation: ['search'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: {
			minValue: 1,
			maxValue: 500,
		},
		displayOptions: {
			show: {
				resource: ['instruments'],
				operation: ['search'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const query = this.getNodeParameter('query', index) as string;
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const limit = returnAll ? undefined : (this.getNodeParameter('limit', index) as number);

	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'POST',
		'/secure/instrument/search',
		{
			searchRequest: {
				query,
			},
		},
	);

	let instruments = extractResponseData<LmaxInstrument[]>(
		response.data || {},
		'instruments.instrument',
		'instrument',
	);

	instruments = ensureArray(instruments);

	if (limit && instruments.length > limit) {
		instruments = instruments.slice(0, limit);
	}

	return [
		{
			json: {
				query,
				count: instruments.length,
				instruments,
			},
			pairedItem: { item: index },
		},
	];
}

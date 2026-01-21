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
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['instruments'],
				operation: ['getAll'],
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
			maxValue: 1000,
		},
		displayOptions: {
			show: {
				resource: ['instruments'],
				operation: ['getAll'],
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
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;
	const limit = returnAll ? undefined : (this.getNodeParameter('limit', index) as number);

	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'GET',
		'/secure/instrument/list',
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
				count: instruments.length,
				instruments,
			},
			pairedItem: { item: index },
		},
	];
}

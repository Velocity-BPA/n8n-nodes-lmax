/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { lmaxApiRequest } from '../../transport/LmaxClient';
import { extractResponseData, ensureArray } from '../../utils/xmlUtils';
import type { LmaxExecution } from '../../types/LmaxTypes';

export const description: INodeProperties[] = [
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['executions'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Instrument ID',
				name: 'instrumentId',
				type: 'number',
				default: 0,
				description: 'Filter by instrument ID',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 100,
				description: 'Maximum number of executions to return',
			},
			{
				displayName: 'Offset',
				name: 'offset',
				type: 'number',
				default: 0,
				description: 'Number of executions to skip for pagination',
			},
		],
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const options = this.getNodeParameter('options', index, {}) as {
		instrumentId?: number;
		limit?: number;
		offset?: number;
	};

	const queryParams: Record<string, number> = {};
	if (options.instrumentId) queryParams.instrumentId = options.instrumentId;
	if (options.limit) queryParams.limit = options.limit;
	if (options.offset) queryParams.offset = options.offset;

	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'GET',
		'/secure/account/executions',
		undefined,
		queryParams,
	);

	let executions = extractResponseData<LmaxExecution[]>(
		response.data || {},
		'executions',
		'execution',
	);

	executions = ensureArray(executions);

	return executions.map((execution: LmaxExecution) => ({
		json: { ...execution } as IDataObject,
		pairedItem: { item: index },
	}));
}

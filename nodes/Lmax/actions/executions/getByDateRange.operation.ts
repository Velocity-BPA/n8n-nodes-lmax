/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { lmaxApiRequest } from '../../transport/LmaxClient';
import { extractResponseData, ensureArray } from '../../utils/xmlUtils';
import type { LmaxExecution } from '../../types/LmaxTypes';

export const description: INodeProperties[] = [
	{
		displayName: 'From',
		name: 'from',
		type: 'dateTime',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['executions'],
				operation: ['getByDateRange'],
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
				resource: ['executions'],
				operation: ['getByDateRange'],
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
				resource: ['executions'],
				operation: ['getByDateRange'],
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
		],
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const from = this.getNodeParameter('from', index) as string;
	const to = this.getNodeParameter('to', index) as string;
	const options = this.getNodeParameter('options', index, {}) as {
		instrumentId?: number;
		limit?: number;
	};

	const queryParams: Record<string, string | number> = {
		from: new Date(from).toISOString(),
		to: new Date(to).toISOString(),
	};
	if (options.instrumentId) queryParams.instrumentId = options.instrumentId;
	if (options.limit) queryParams.limit = options.limit;

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

	return [
		{
			json: {
				from,
				to,
				count: executions.length,
				executions,
			},
			pairedItem: { item: index },
		},
	];
}

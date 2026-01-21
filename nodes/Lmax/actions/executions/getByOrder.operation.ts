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
		displayName: 'Instruction ID',
		name: 'instructionId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['executions'],
				operation: ['getByOrder'],
			},
		},
		description: 'The order instruction ID to get executions for',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const instructionId = this.getNodeParameter('instructionId', index) as string;

	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'GET',
		'/secure/account/executions',
		undefined,
		{ instructionId },
	);

	let executions = extractResponseData<LmaxExecution[]>(
		response.data || {},
		'executions',
		'execution',
	);

	executions = ensureArray(executions);

	return executions.map((execution: LmaxExecution) => ({
		json: {
			...execution,
		} as IDataObject,
		pairedItem: { item: index },
	}));
}

/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { lmaxApiRequest } from '../../transport/LmaxClient';
import { extractResponseData } from '../../utils/xmlUtils';
import type { LmaxRejection } from '../../types/LmaxTypes';

export const description: INodeProperties[] = [
	{
		displayName: 'Instruction ID',
		name: 'instructionId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['rejections'],
				operation: ['getByInstruction'],
			},
		},
		description: 'The instruction ID to get rejection for',
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
		'/secure/account/rejections',
		undefined,
		{ instructionId },
	);

	const rejection = extractResponseData<LmaxRejection | null>(
		response.data || {},
		'rejection',
		'instructionRejectedEvent',
	);

	if (!rejection) {
		return [
			{
				json: {
					instructionId,
					found: false,
					message: 'No rejection found for this instruction',
				},
				pairedItem: { item: index },
			},
		];
	}

	return [
		{
			json: {
				found: true,
				...rejection,
			} as IDataObject,
			pairedItem: { item: index },
		},
	];
}

/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { lmaxApiRequest } from '../../transport/LmaxClient';
import { extractResponseData } from '../../utils/xmlUtils';
import type { LmaxOrder } from '../../types/LmaxTypes';

export const description: INodeProperties[] = [
	{
		displayName: 'Instruction ID',
		name: 'instructionId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['getOrderById'],
			},
		},
		description: 'Instruction ID of the order to retrieve',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const instructionId = this.getNodeParameter('instructionId', index) as string;

	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'POST',
		'/secure/order/getOrder',
		{
			orderRequest: {
				instructionId,
			},
		},
	);

	const order = extractResponseData<LmaxOrder>(response.data || {}, 'order', 'orderData');

	return [
		{
			json: {
				instructionId,
				...order,
			},
			pairedItem: { item: index },
		},
	];
}

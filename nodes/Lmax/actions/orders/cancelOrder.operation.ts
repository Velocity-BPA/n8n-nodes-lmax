/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { lmaxApiRequest, generateInstructionId } from '../../transport/LmaxClient';
import { extractResponseData } from '../../utils/xmlUtils';

export const description: INodeProperties[] = [
	{
		displayName: 'Instrument ID',
		name: 'instrumentId',
		type: 'number',
		default: 4001,
		required: true,
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['cancelOrder'],
			},
		},
		description: 'Instrument of the order to cancel',
	},
	{
		displayName: 'Original Instruction ID',
		name: 'originalInstructionId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['cancelOrder'],
			},
		},
		description: 'Instruction ID of the order to cancel',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const instrumentId = this.getNodeParameter('instrumentId', index) as number;
	const originalInstructionId = this.getNodeParameter('originalInstructionId', index) as string;

	const instructionId = generateInstructionId();

	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'POST',
		'/secure/order/cancelOrder',
		{
			cancelOrderRequest: {
				instructionId,
				originalInstructionId,
				instrumentId,
			},
		},
	);

	const result = extractResponseData<Record<string, unknown>>(
		response.data || {},
		'orderResponse',
		'cancelResponse',
	);

	return [
		{
			json: {
				success: true,
				instructionId,
				originalInstructionId,
				instrumentId,
				action: 'CANCEL',
				...result,
			},
			pairedItem: { item: index },
		},
	];
}

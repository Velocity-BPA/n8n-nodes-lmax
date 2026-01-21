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
				operation: ['amendOrder'],
			},
		},
		description: 'Instrument of the order to amend',
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
				operation: ['amendOrder'],
			},
		},
		description: 'Instruction ID of the order to amend',
	},
	{
		displayName: 'New Quantity',
		name: 'quantity',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['amendOrder'],
			},
		},
		description: 'New order quantity (leave 0 to keep unchanged)',
	},
	{
		displayName: 'New Price',
		name: 'price',
		type: 'number',
		default: 0,
		typeOptions: {
			numberPrecision: 5,
		},
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['amendOrder'],
			},
		},
		description: 'New limit price (leave 0 to keep unchanged)',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const instrumentId = this.getNodeParameter('instrumentId', index) as number;
	const originalInstructionId = this.getNodeParameter('originalInstructionId', index) as string;
	const quantity = this.getNodeParameter('quantity', index) as number;
	const price = this.getNodeParameter('price', index) as number;

	const instructionId = generateInstructionId();

	const amendRequest: Record<string, unknown> = {
		instructionId,
		originalInstructionId,
		instrumentId,
	};

	if (quantity !== 0) {
		amendRequest.quantity = quantity;
	}

	if (price !== 0) {
		amendRequest.price = price;
	}

	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'POST',
		'/secure/order/amendOrder',
		{
			amendOrderRequest: amendRequest,
		},
	);

	const result = extractResponseData<Record<string, unknown>>(
		response.data || {},
		'orderResponse',
		'amendResponse',
	);

	return [
		{
			json: {
				success: true,
				instructionId,
				originalInstructionId,
				instrumentId,
				action: 'AMEND',
				newQuantity: quantity || 'unchanged',
				newPrice: price || 'unchanged',
				...result,
			},
			pairedItem: { item: index },
		},
	];
}

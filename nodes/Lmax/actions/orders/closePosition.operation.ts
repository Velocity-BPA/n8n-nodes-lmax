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
				operation: ['closePosition'],
			},
		},
		description: 'Instrument of the position to close',
	},
	{
		displayName: 'Quantity',
		name: 'quantity',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['closePosition'],
			},
		},
		description:
			'Quantity to close (positive for long positions, negative for short positions)',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const instrumentId = this.getNodeParameter('instrumentId', index) as number;
	const quantity = this.getNodeParameter('quantity', index) as number;

	const instructionId = generateInstructionId();

	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'POST',
		'/secure/order/placeClosingOrder',
		{
			closingOrderRequest: {
				instructionId,
				instrumentId,
				quantity: -quantity, // Closing order uses opposite sign
			},
		},
	);

	const result = extractResponseData<Record<string, unknown>>(
		response.data || {},
		'orderResponse',
		'closingOrderResponse',
	);

	return [
		{
			json: {
				success: true,
				instructionId,
				instrumentId,
				closedQuantity: quantity,
				action: 'CLOSE_POSITION',
				...result,
			},
			pairedItem: { item: index },
		},
	];
}

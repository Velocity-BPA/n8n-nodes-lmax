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
				resource: ['positions'],
				operation: ['closePartial'],
			},
		},
		description: 'Instrument ID of the position to partially close',
	},
	{
		displayName: 'Quantity',
		name: 'quantity',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: ['positions'],
				operation: ['closePartial'],
			},
		},
		description: 'Quantity to close',
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
		'/secure/position/closePartial',
		{
			closePartialRequest: {
				instructionId,
				instrumentId,
				quantity,
			},
		},
	);

	const result = extractResponseData<Record<string, unknown>>(
		response.data || {},
		'closeResponse',
		'positionCloseResponse',
	);

	return [
		{
			json: {
				success: true,
				instructionId,
				instrumentId,
				closedQuantity: quantity,
				action: 'CLOSE_PARTIAL',
				...result,
			},
			pairedItem: { item: index },
		},
	];
}

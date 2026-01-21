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
				operation: ['amendStops'],
			},
		},
		description: 'Instrument of the order to amend stops',
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
				operation: ['amendStops'],
			},
		},
		description: 'Instruction ID of the order to amend',
	},
	{
		displayName: 'Stop Loss Offset',
		name: 'stopLossOffset',
		type: 'number',
		default: 0,
		typeOptions: {
			numberPrecision: 5,
		},
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['amendStops'],
			},
		},
		description: 'New stop-loss offset (0 to remove, leave empty to keep unchanged)',
	},
	{
		displayName: 'Take Profit Offset',
		name: 'stopProfitOffset',
		type: 'number',
		default: 0,
		typeOptions: {
			numberPrecision: 5,
		},
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['amendStops'],
			},
		},
		description: 'New take-profit offset (0 to remove, leave empty to keep unchanged)',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const instrumentId = this.getNodeParameter('instrumentId', index) as number;
	const originalInstructionId = this.getNodeParameter('originalInstructionId', index) as string;
	const stopLossOffset = this.getNodeParameter('stopLossOffset', index) as number;
	const stopProfitOffset = this.getNodeParameter('stopProfitOffset', index) as number;

	const instructionId = generateInstructionId();

	const amendRequest: Record<string, unknown> = {
		instructionId,
		originalInstructionId,
		instrumentId,
		stopLossOffset,
		stopProfitOffset,
	};

	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'POST',
		'/secure/order/amendStops',
		{
			amendStopsRequest: amendRequest,
		},
	);

	const result = extractResponseData<Record<string, unknown>>(
		response.data || {},
		'orderResponse',
		'amendStopsResponse',
	);

	return [
		{
			json: {
				success: true,
				instructionId,
				originalInstructionId,
				instrumentId,
				action: 'AMEND_STOPS',
				stopLossOffset,
				stopProfitOffset,
				...result,
			},
			pairedItem: { item: index },
		},
	];
}

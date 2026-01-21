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
				operation: ['placeMarketOrder'],
			},
		},
		description: 'Instrument to trade (e.g., 4001 for EUR/USD)',
	},
	{
		displayName: 'Quantity',
		name: 'quantity',
		type: 'number',
		default: 10000,
		required: true,
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['placeMarketOrder'],
			},
		},
		description: 'Order quantity (positive for buy, negative for sell)',
	},
	{
		displayName: 'Time in Force',
		name: 'timeInForce',
		type: 'options',
		options: [
			{ name: 'Immediate or Cancel (IOC)', value: 'IOC' },
			{ name: 'Fill or Kill (FOK)', value: 'FOK' },
		],
		default: 'IOC',
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['placeMarketOrder'],
			},
		},
		description: 'How long the order remains active',
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['placeMarketOrder'],
			},
		},
		options: [
			{
				displayName: 'Instruction ID',
				name: 'instructionId',
				type: 'string',
				default: '',
				description: 'Custom instruction ID (auto-generated if not provided)',
			},
			{
				displayName: 'Stop Loss Offset',
				name: 'stopLossOffset',
				type: 'number',
				default: 0,
				typeOptions: {
					numberPrecision: 5,
				},
				description: 'Stop-loss offset from entry price',
			},
			{
				displayName: 'Take Profit Offset',
				name: 'stopProfitOffset',
				type: 'number',
				default: 0,
				typeOptions: {
					numberPrecision: 5,
				},
				description: 'Take-profit offset from entry price',
			},
		],
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const instrumentId = this.getNodeParameter('instrumentId', index) as number;
	const quantity = this.getNodeParameter('quantity', index) as number;
	const timeInForce = this.getNodeParameter('timeInForce', index) as string;
	const additionalOptions = this.getNodeParameter('additionalOptions', index) as {
		instructionId?: string;
		stopLossOffset?: number;
		stopProfitOffset?: number;
	};

	const instructionId = additionalOptions.instructionId || generateInstructionId();

	const orderRequest: Record<string, unknown> = {
		instrumentId,
		instructionId,
		quantity,
		timeInForce,
	};

	if (additionalOptions.stopLossOffset) {
		orderRequest.stopLossOffset = additionalOptions.stopLossOffset;
	}

	if (additionalOptions.stopProfitOffset) {
		orderRequest.stopProfitOffset = additionalOptions.stopProfitOffset;
	}

	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'POST',
		'/secure/order/placeMarketOrder',
		{
			marketOrderSpecification: orderRequest,
		},
	);

	const result = extractResponseData<Record<string, unknown>>(
		response.data || {},
		'orderResponse',
		'order',
	);

	return [
		{
			json: {
				success: true,
				instructionId,
				instrumentId,
				quantity,
				timeInForce,
				orderType: 'MARKET',
				...result,
			},
			pairedItem: { item: index },
		},
	];
}

/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { lmaxApiRequest } from '../../transport/LmaxClient';
import { extractResponseData, ensureArray } from '../../utils/xmlUtils';
import type { LmaxOrder } from '../../types/LmaxTypes';

export const description: INodeProperties[] = [
	{
		displayName: 'Filter by Instrument',
		name: 'filterByInstrument',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['getWorkingOrders'],
			},
		},
		description: 'Whether to filter orders by instrument ID',
	},
	{
		displayName: 'Instrument ID',
		name: 'instrumentId',
		type: 'number',
		default: 4001,
		displayOptions: {
			show: {
				resource: ['orders'],
				operation: ['getWorkingOrders'],
				filterByInstrument: [true],
			},
		},
		description: 'Filter orders by this instrument ID',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const filterByInstrument = this.getNodeParameter('filterByInstrument', index) as boolean;

	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'GET',
		'/secure/order/workingOrders',
	);

	let orders = extractResponseData<LmaxOrder[]>(
		response.data || {},
		'orders.order',
		'workingOrders.order',
	);

	orders = ensureArray(orders);

	if (filterByInstrument) {
		const instrumentId = this.getNodeParameter('instrumentId', index) as number;
		orders = orders.filter((order) => order.instrumentId === instrumentId);
	}

	return [
		{
			json: {
				count: orders.length,
				orders,
			},
			pairedItem: { item: index },
		},
	];
}

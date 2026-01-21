/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';
import * as placeLimitOrder from './placeLimitOrder.operation';
import * as placeMarketOrder from './placeMarketOrder.operation';
import * as placeStopOrder from './placeStopOrder.operation';
import * as cancelOrder from './cancelOrder.operation';
import * as amendOrder from './amendOrder.operation';
import * as amendStops from './amendStops.operation';
import * as getWorkingOrders from './getWorkingOrders.operation';
import * as getOrderById from './getOrderById.operation';
import * as closePosition from './closePosition.operation';

export {
	placeLimitOrder,
	placeMarketOrder,
	placeStopOrder,
	cancelOrder,
	amendOrder,
	amendStops,
	getWorkingOrders,
	getOrderById,
	closePosition,
};

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['orders'],
			},
		},
		options: [
			{
				name: 'Amend Order',
				value: 'amendOrder',
				description: 'Modify an existing order',
				action: 'Amend order',
			},
			{
				name: 'Amend Stops',
				value: 'amendStops',
				description: 'Modify stop-loss and take-profit levels',
				action: 'Amend stops',
			},
			{
				name: 'Cancel Order',
				value: 'cancelOrder',
				description: 'Cancel an existing order',
				action: 'Cancel order',
			},
			{
				name: 'Close Position',
				value: 'closePosition',
				description: 'Close a position with a closing order',
				action: 'Close position',
			},
			{
				name: 'Get Order by ID',
				value: 'getOrderById',
				description: 'Get details of a specific order',
				action: 'Get order by ID',
			},
			{
				name: 'Get Working Orders',
				value: 'getWorkingOrders',
				description: 'List all working orders',
				action: 'Get working orders',
			},
			{
				name: 'Place Limit Order',
				value: 'placeLimitOrder',
				description: 'Place a new limit order',
				action: 'Place limit order',
			},
			{
				name: 'Place Market Order',
				value: 'placeMarketOrder',
				description: 'Place a new market order',
				action: 'Place market order',
			},
			{
				name: 'Place Stop Order',
				value: 'placeStopOrder',
				description: 'Place a stop order',
				action: 'Place stop order',
			},
		],
		default: 'placeLimitOrder',
	},
	...placeLimitOrder.description,
	...placeMarketOrder.description,
	...placeStopOrder.description,
	...cancelOrder.description,
	...amendOrder.description,
	...amendStops.description,
	...getWorkingOrders.description,
	...getOrderById.description,
	...closePosition.description,
];

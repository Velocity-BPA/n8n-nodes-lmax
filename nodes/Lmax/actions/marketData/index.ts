/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';
import * as subscribeOrderBook from './subscribeOrderBook.operation';
import * as unsubscribeOrderBook from './unsubscribeOrderBook.operation';
import * as getTopOfBook from './getTopOfBook.operation';
import * as getOrderBookDepth from './getOrderBookDepth.operation';
import * as getLastTrade from './getLastTrade.operation';

export {
	subscribeOrderBook,
	unsubscribeOrderBook,
	getTopOfBook,
	getOrderBookDepth,
	getLastTrade,
};

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['marketData'],
			},
		},
		options: [
			{
				name: 'Get Last Trade',
				value: 'getLastTrade',
				description: 'Get last trade information',
				action: 'Get last trade',
			},
			{
				name: 'Get Order Book Depth',
				value: 'getOrderBookDepth',
				description: 'Get full order book depth',
				action: 'Get order book depth',
			},
			{
				name: 'Get Top of Book',
				value: 'getTopOfBook',
				description: 'Get current top of book (best bid/ask)',
				action: 'Get top of book',
			},
			{
				name: 'Subscribe to Order Book',
				value: 'subscribeOrderBook',
				description: 'Subscribe to order book updates for an instrument',
				action: 'Subscribe to order book',
			},
			{
				name: 'Unsubscribe from Order Book',
				value: 'unsubscribeOrderBook',
				description: 'Unsubscribe from order book updates',
				action: 'Unsubscribe from order book',
			},
		],
		default: 'getTopOfBook',
	},
	...subscribeOrderBook.description,
	...unsubscribeOrderBook.description,
	...getTopOfBook.description,
	...getOrderBookDepth.description,
	...getLastTrade.description,
];

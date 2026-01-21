/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';
import * as getTopOfBookHistory from './getTopOfBookHistory.operation';
import * as getAggregateHistory from './getAggregateHistory.operation';
import * as getTradeHistory from './getTradeHistory.operation';
import * as downloadHistoricalData from './downloadHistoricalData.operation';

export { getTopOfBookHistory, getAggregateHistory, getTradeHistory, downloadHistoricalData };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['historicalData'],
			},
		},
		options: [
			{
				name: 'Download Historical Data',
				value: 'downloadHistoricalData',
				description: 'Download historical data as CSV',
				action: 'Download historical data',
			},
			{
				name: 'Get Aggregate History',
				value: 'getAggregateHistory',
				description: 'Get aggregated OHLCV data',
				action: 'Get aggregate history',
			},
			{
				name: 'Get Top of Book History',
				value: 'getTopOfBookHistory',
				description: 'Get historical top of book tick data',
				action: 'Get top of book history',
			},
			{
				name: 'Get Trade History',
				value: 'getTradeHistory',
				description: 'Get historical trade data',
				action: 'Get trade history',
			},
		],
		default: 'getAggregateHistory',
	},
	...getTopOfBookHistory.description,
	...getAggregateHistory.description,
	...getTradeHistory.description,
	...downloadHistoricalData.description,
];

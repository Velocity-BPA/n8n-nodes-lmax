/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';
import * as getState from './getState.operation';
import * as subscribe from './subscribe.operation';
import * as unsubscribe from './unsubscribe.operation';
import * as getWalletDetails from './getWalletDetails.operation';
import * as getAccountDetails from './getAccountDetails.operation';
import * as getTradingResources from './getTradingResources.operation';

export { getState, subscribe, unsubscribe, getWalletDetails, getAccountDetails, getTradingResources };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['account'],
			},
		},
		options: [
			{
				name: 'Get Account Details',
				value: 'getAccountDetails',
				description: 'Get detailed account information',
				action: 'Get account details',
			},
			{
				name: 'Get State',
				value: 'getState',
				description: 'Retrieve current account state and balances',
				action: 'Get account state',
			},
			{
				name: 'Get Trading Resources',
				value: 'getTradingResources',
				description: 'Get available trading resources and margin',
				action: 'Get trading resources',
			},
			{
				name: 'Get Wallet Details',
				value: 'getWalletDetails',
				description: 'Get wallet information (for crypto accounts)',
				action: 'Get wallet details',
			},
			{
				name: 'Subscribe',
				value: 'subscribe',
				description: 'Subscribe to account state updates',
				action: 'Subscribe to account updates',
			},
			{
				name: 'Unsubscribe',
				value: 'unsubscribe',
				description: 'Unsubscribe from account state updates',
				action: 'Unsubscribe from account updates',
			},
		],
		default: 'getState',
	},
	...getState.description,
	...subscribe.description,
	...unsubscribe.description,
	...getWalletDetails.description,
	...getAccountDetails.description,
	...getTradingResources.description,
];

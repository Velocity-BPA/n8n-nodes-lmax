/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';
import * as getAll from './getAll.operation';
import * as getByOrder from './getByOrder.operation';
import * as getByDateRange from './getByDateRange.operation';
import * as subscribe from './subscribe.operation';
import * as unsubscribe from './unsubscribe.operation';

export { getAll, getByOrder, getByDateRange, subscribe, unsubscribe };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['executions'],
			},
		},
		options: [
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all executions for the account',
				action: 'Get all executions',
			},
			{
				name: 'Get by Date Range',
				value: 'getByDateRange',
				description: 'Get executions within date range',
				action: 'Get executions by date range',
			},
			{
				name: 'Get by Order',
				value: 'getByOrder',
				description: 'Get executions for a specific order',
				action: 'Get executions by order',
			},
			{
				name: 'Subscribe',
				value: 'subscribe',
				description: 'Subscribe to execution updates',
				action: 'Subscribe to executions',
			},
			{
				name: 'Unsubscribe',
				value: 'unsubscribe',
				description: 'Unsubscribe from execution updates',
				action: 'Unsubscribe from executions',
			},
		],
		default: 'getAll',
	},
	...getAll.description,
	...getByOrder.description,
	...getByDateRange.description,
	...subscribe.description,
	...unsubscribe.description,
];

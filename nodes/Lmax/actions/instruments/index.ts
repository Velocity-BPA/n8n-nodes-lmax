/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';
import * as search from './search.operation';
import * as getById from './getById.operation';
import * as getAll from './getAll.operation';
import * as getByAssetClass from './getByAssetClass.operation';
import * as subscribe from './subscribe.operation';
import * as unsubscribe from './unsubscribe.operation';

export { search, getById, getAll, getByAssetClass, subscribe, unsubscribe };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['instruments'],
			},
		},
		options: [
			{
				name: 'Get All',
				value: 'getAll',
				description: 'List all available instruments',
				action: 'Get all instruments',
			},
			{
				name: 'Get by Asset Class',
				value: 'getByAssetClass',
				description: 'Get instruments filtered by asset class',
				action: 'Get instruments by asset class',
			},
			{
				name: 'Get by ID',
				value: 'getById',
				description: 'Get instrument details by ID',
				action: 'Get instrument by ID',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search for instruments by name or criteria',
				action: 'Search instruments',
			},
			{
				name: 'Subscribe',
				value: 'subscribe',
				description: 'Subscribe to instrument updates',
				action: 'Subscribe to instrument updates',
			},
			{
				name: 'Unsubscribe',
				value: 'unsubscribe',
				description: 'Unsubscribe from instrument updates',
				action: 'Unsubscribe from instrument updates',
			},
		],
		default: 'getAll',
	},
	...search.description,
	...getById.description,
	...getAll.description,
	...getByAssetClass.description,
	...subscribe.description,
	...unsubscribe.description,
];

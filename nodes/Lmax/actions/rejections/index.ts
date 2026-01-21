/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';
import * as getAll from './getAll.operation';
import * as getByInstruction from './getByInstruction.operation';
import * as subscribe from './subscribe.operation';
import * as unsubscribe from './unsubscribe.operation';

export { getAll, getByInstruction, subscribe, unsubscribe };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['rejections'],
			},
		},
		options: [
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all instruction rejections',
				action: 'Get all rejections',
			},
			{
				name: 'Get by Instruction',
				value: 'getByInstruction',
				description: 'Get rejection for specific instruction',
				action: 'Get rejection by instruction',
			},
			{
				name: 'Subscribe',
				value: 'subscribe',
				description: 'Subscribe to rejection events',
				action: 'Subscribe to rejections',
			},
			{
				name: 'Unsubscribe',
				value: 'unsubscribe',
				description: 'Unsubscribe from rejection events',
				action: 'Unsubscribe from rejections',
			},
		],
		default: 'getAll',
	},
	...getAll.description,
	...getByInstruction.description,
	...subscribe.description,
	...unsubscribe.description,
];

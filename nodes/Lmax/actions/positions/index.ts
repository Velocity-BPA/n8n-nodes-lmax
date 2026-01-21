/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';
import * as getAll from './getAll.operation';
import * as getByInstrument from './getByInstrument.operation';
import * as subscribe from './subscribe.operation';
import * as unsubscribe from './unsubscribe.operation';
import * as closeAll from './closeAll.operation';
import * as closePartial from './closePartial.operation';

export { getAll, getByInstrument, subscribe, unsubscribe, closeAll, closePartial };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['positions'],
			},
		},
		options: [
			{
				name: 'Close All',
				value: 'closeAll',
				description: 'Close all positions for an instrument',
				action: 'Close all positions',
			},
			{
				name: 'Close Partial',
				value: 'closePartial',
				description: 'Partially close a position',
				action: 'Close partial position',
			},
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all open positions',
				action: 'Get all positions',
			},
			{
				name: 'Get by Instrument',
				value: 'getByInstrument',
				description: 'Get position for specific instrument',
				action: 'Get position by instrument',
			},
			{
				name: 'Subscribe',
				value: 'subscribe',
				description: 'Subscribe to position updates',
				action: 'Subscribe to position updates',
			},
			{
				name: 'Unsubscribe',
				value: 'unsubscribe',
				description: 'Unsubscribe from position updates',
				action: 'Unsubscribe from position updates',
			},
		],
		default: 'getAll',
	},
	...getAll.description,
	...getByInstrument.description,
	...subscribe.description,
	...unsubscribe.description,
	...closeAll.description,
	...closePartial.description,
];

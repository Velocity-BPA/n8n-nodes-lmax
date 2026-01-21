/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';
import * as poll from './poll.operation';
import * as subscribe from './subscribe.operation';
import * as unsubscribe from './unsubscribe.operation';
import * as acknowledge from './acknowledge.operation';

export { poll, subscribe, unsubscribe, acknowledge };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['events'],
			},
		},
		options: [
			{
				name: 'Acknowledge',
				value: 'acknowledge',
				description: 'Acknowledge receipt of events',
				action: 'Acknowledge events',
			},
			{
				name: 'Poll',
				value: 'poll',
				description: 'Poll for new events from the event stream',
				action: 'Poll events',
			},
			{
				name: 'Subscribe',
				value: 'subscribe',
				description: 'Subscribe to specific event types',
				action: 'Subscribe to events',
			},
			{
				name: 'Unsubscribe',
				value: 'unsubscribe',
				description: 'Unsubscribe from event types',
				action: 'Unsubscribe from events',
			},
		],
		default: 'poll',
	},
	...poll.description,
	...subscribe.description,
	...unsubscribe.description,
	...acknowledge.description,
];

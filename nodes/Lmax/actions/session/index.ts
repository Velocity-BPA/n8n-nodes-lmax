/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties } from 'n8n-workflow';
import * as login from './login.operation';
import * as logout from './logout.operation';
import * as heartbeat from './heartbeat.operation';
import * as getVersion from './getVersion.operation';
import * as validateSession from './validateSession.operation';

export { login, logout, heartbeat, getVersion, validateSession };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['session'],
			},
		},
		options: [
			{
				name: 'Get Version',
				value: 'getVersion',
				description: 'Get API version information',
				action: 'Get API version',
			},
			{
				name: 'Heartbeat',
				value: 'heartbeat',
				description: 'Send heartbeat to keep session alive',
				action: 'Send heartbeat',
			},
			{
				name: 'Login',
				value: 'login',
				description: 'Authenticate and establish a new session',
				action: 'Login to LMAX',
			},
			{
				name: 'Logout',
				value: 'logout',
				description: 'Terminate the current session',
				action: 'Logout from LMAX',
			},
			{
				name: 'Validate Session',
				value: 'validateSession',
				description: 'Check if current session is valid',
				action: 'Validate session',
			},
		],
		default: 'login',
	},
	...login.description,
	...logout.description,
	...heartbeat.description,
	...getVersion.description,
	...validateSession.description,
];

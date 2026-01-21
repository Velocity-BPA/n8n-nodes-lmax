/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class LmaxApi implements ICredentialType {
	name = 'lmaxApi';

	displayName = 'LMAX API';

	documentationUrl = 'https://docs.lmax.com';

	properties: INodeProperties[] = [
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			required: true,
			description: 'Your LMAX account username',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your LMAX account password',
		},
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Demo',
					value: 'demo',
				},
				{
					name: 'Live',
					value: 'live',
				},
			],
			default: 'demo',
			required: true,
			description: 'Select the LMAX environment to connect to',
		},
		{
			displayName: 'Product Type',
			name: 'productType',
			type: 'options',
			options: [
				{
					name: 'CFD Demo',
					value: 'CFD_DEMO',
				},
				{
					name: 'CFD Live',
					value: 'CFD_LIVE',
				},
				{
					name: 'Crypto Demo',
					value: 'CRYPTO_DEMO',
				},
				{
					name: 'Crypto Live',
					value: 'CRYPTO_LIVE',
				},
			],
			default: 'CFD_DEMO',
			required: true,
			description: 'Select the product type for your LMAX account',
		},
	];

	// Session-based authentication doesn't use standard authenticate
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.environment === "live" ? "https://trade.lmaxtrader.com" : "https://testapi.lmaxtrader.com"}}',
			url: '/public/security/login',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Accept: 'application/xml',
			},
			body: '=username={{encodeURIComponent($credentials.username)}}&password={{encodeURIComponent($credentials.password)}}&productType={{$credentials.productType}}',
		},
	};
}

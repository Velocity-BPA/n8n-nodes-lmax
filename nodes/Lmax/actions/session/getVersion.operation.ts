/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { getCredentials, getBaseUrl } from '../../transport/LmaxClient';
import { extractResponseData } from '../../utils/xmlUtils';

export const description: INodeProperties[] = [];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const credentials = await getCredentials(this);
	const baseUrl = getBaseUrl(credentials.environment);

	// Make request without auth to get public version info
	const options = {
		method: 'GET' as const,
		url: `${baseUrl}/public/version`,
		headers: {
			Accept: 'application/xml',
		},
	};

	const response = await this.helpers.httpRequest(options);
	const version = extractResponseData<string>(response, 'version', 'apiVersion');

	return [
		{
			json: {
				version: version || 'Unknown',
				environment: credentials.environment,
				baseUrl,
				timestamp: new Date().toISOString(),
			},
			pairedItem: { item: index },
		},
	];
}

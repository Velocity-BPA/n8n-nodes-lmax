/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { getSession, getCredentials, getBaseUrl } from '../../transport/LmaxClient';

export const description: INodeProperties[] = [];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const credentials = await getCredentials(this);
	const session = await getSession(this);

	return [
		{
			json: {
				success: true,
				sessionId: session.sessionId,
				accountId: session.accountId,
				environment: credentials.environment,
				productType: credentials.productType,
				baseUrl: getBaseUrl(credentials.environment),
				expiresAt: new Date(session.expiresAt).toISOString(),
			},
			pairedItem: { item: index },
		},
	];
}

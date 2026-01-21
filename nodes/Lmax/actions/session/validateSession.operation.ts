/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { lmaxApiRequest, getSession } from '../../transport/LmaxClient';

export const description: INodeProperties[] = [];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	try {
		const session = await getSession(this);
		await lmaxApiRequest(this, 'GET', '/secure/account/validate');

		return [
			{
				json: {
					valid: true,
					sessionId: session.sessionId,
					accountId: session.accountId,
					expiresAt: new Date(session.expiresAt).toISOString(),
				},
				pairedItem: { item: index },
			},
		];
	} catch (error) {
		return [
			{
				json: {
					valid: false,
					error: (error as Error).message,
				},
				pairedItem: { item: index },
			},
		];
	}
}

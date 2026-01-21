/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { sendHeartbeat, getSession } from '../../transport/LmaxClient';

export const description: INodeProperties[] = [];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const success = await sendHeartbeat(this);
	const session = await getSession(this);

	return [
		{
			json: {
				success,
				sessionId: session.sessionId,
				accountId: session.accountId,
				timestamp: new Date().toISOString(),
			},
			pairedItem: { item: index },
		},
	];
}

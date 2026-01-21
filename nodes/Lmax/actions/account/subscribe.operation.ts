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
	const session = await getSession(this);

	await lmaxApiRequest(this, 'POST', '/secure/account/subscribe', {
		subscribeRequest: {
			accountId: session.accountId,
		},
	});

	return [
		{
			json: {
				success: true,
				accountId: session.accountId,
				subscription: 'accountState',
				message: 'Subscribed to account state updates',
			},
			pairedItem: { item: index },
		},
	];
}

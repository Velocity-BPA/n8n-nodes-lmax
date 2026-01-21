/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { lmaxApiRequest, getSession } from '../../transport/LmaxClient';
import { extractResponseData, ensureArray } from '../../utils/xmlUtils';

export const description: INodeProperties[] = [];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const session = await getSession(this);

	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'GET',
		'/secure/account/wallet',
	);

	const wallets = extractResponseData<unknown[]>(
		response.data || {},
		'wallets.wallet',
		'wallet',
	);

	return [
		{
			json: {
				accountId: session.accountId,
				wallets: ensureArray(wallets),
				timestamp: new Date().toISOString(),
			},
			pairedItem: { item: index },
		},
	];
}

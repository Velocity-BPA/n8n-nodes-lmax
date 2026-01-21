/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { lmaxApiRequest, getSession } from '../../transport/LmaxClient';
import { extractResponseData } from '../../utils/xmlUtils';
import type { LmaxAccountState } from '../../types/LmaxTypes';

export const description: INodeProperties[] = [];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const session = await getSession(this);
	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'GET',
		'/secure/account/state',
	);

	const accountState = extractResponseData<LmaxAccountState>(
		response.data || {},
		'accountState',
		'account',
	);

	return [
		{
			json: {
				accountId: session.accountId,
				...accountState,
				timestamp: new Date().toISOString(),
			},
			pairedItem: { item: index },
		},
	];
}

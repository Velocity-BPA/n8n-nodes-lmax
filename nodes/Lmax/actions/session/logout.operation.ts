/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { lmaxApiRequest, invalidateSession } from '../../transport/LmaxClient';

export const description: INodeProperties[] = [];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	await lmaxApiRequest(this, 'POST', '/public/security/logout');
	await invalidateSession(this);

	return [
		{
			json: {
				success: true,
				message: 'Session terminated successfully',
			},
			pairedItem: { item: index },
		},
	];
}

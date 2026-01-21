/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { lmaxApiRequest } from '../../transport/LmaxClient';
import { extractResponseData, ensureArray } from '../../utils/xmlUtils';
import type { LmaxPosition } from '../../types/LmaxTypes';

export const description: INodeProperties[] = [];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'GET',
		'/secure/position/all',
	);

	let positions = extractResponseData<LmaxPosition[]>(
		response.data || {},
		'positions.position',
		'position',
	);

	positions = ensureArray(positions);

	return [
		{
			json: {
				count: positions.length,
				positions,
			},
			pairedItem: { item: index },
		},
	];
}

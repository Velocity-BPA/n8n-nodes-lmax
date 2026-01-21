/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { lmaxApiRequest } from '../../transport/LmaxClient';
import { extractResponseData } from '../../utils/xmlUtils';
import type { LmaxPosition } from '../../types/LmaxTypes';

export const description: INodeProperties[] = [
	{
		displayName: 'Instrument ID',
		name: 'instrumentId',
		type: 'number',
		default: 4001,
		required: true,
		displayOptions: {
			show: {
				resource: ['positions'],
				operation: ['getByInstrument'],
			},
		},
		description: 'Instrument ID to get position for',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const instrumentId = this.getNodeParameter('instrumentId', index) as number;

	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'POST',
		'/secure/position/get',
		{
			positionRequest: {
				instrumentId,
			},
		},
	);

	const position = extractResponseData<LmaxPosition>(
		response.data || {},
		'position',
		'positionData',
	);

	return [
		{
			json: {
				instrumentId,
				...position,
			},
			pairedItem: { item: index },
		},
	];
}

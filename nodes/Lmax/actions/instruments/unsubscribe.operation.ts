/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData } from 'n8n-workflow';
import { lmaxApiRequest } from '../../transport/LmaxClient';

export const description: INodeProperties[] = [
	{
		displayName: 'Instrument ID',
		name: 'instrumentId',
		type: 'number',
		default: 4001,
		required: true,
		displayOptions: {
			show: {
				resource: ['instruments'],
				operation: ['unsubscribe'],
			},
		},
		description: 'Unique instrument identifier to unsubscribe from',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const instrumentId = this.getNodeParameter('instrumentId', index) as number;

	await lmaxApiRequest(this, 'POST', '/secure/instrument/unsubscribe', {
		unsubscribeRequest: {
			instrumentId,
		},
	});

	return [
		{
			json: {
				success: true,
				instrumentId,
				message: `Unsubscribed from instrument ${instrumentId} updates`,
			},
			pairedItem: { item: index },
		},
	];
}

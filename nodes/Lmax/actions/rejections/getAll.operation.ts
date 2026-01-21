/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, INodeExecutionData, IDataObject } from 'n8n-workflow';
import { lmaxApiRequest } from '../../transport/LmaxClient';
import { extractResponseData, ensureArray } from '../../utils/xmlUtils';
import type { LmaxRejection } from '../../types/LmaxTypes';

export const description: INodeProperties[] = [
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['rejections'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'From',
				name: 'from',
				type: 'dateTime',
				default: '',
				description: 'Start timestamp to filter rejections',
			},
			{
				displayName: 'To',
				name: 'to',
				type: 'dateTime',
				default: '',
				description: 'End timestamp to filter rejections',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 100,
				description: 'Maximum number of rejections to return',
			},
		],
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const options = this.getNodeParameter('options', index, {}) as {
		from?: string;
		to?: string;
		limit?: number;
	};

	const queryParams: Record<string, string | number> = {};
	if (options.from) queryParams.from = new Date(options.from).toISOString();
	if (options.to) queryParams.to = new Date(options.to).toISOString();
	if (options.limit) queryParams.limit = options.limit;

	const response = await lmaxApiRequest<Record<string, unknown>>(
		this,
		'GET',
		'/secure/account/rejections',
		undefined,
		Object.keys(queryParams).length > 0 ? queryParams : undefined,
	);

	let rejections = extractResponseData<LmaxRejection[]>(
		response.data || {},
		'rejections',
		'rejection',
	);

	rejections = ensureArray(rejections);

	return rejections.map((rejection: LmaxRejection) => ({
		json: { ...rejection } as IDataObject,
		pairedItem: { item: index },
	}));
}

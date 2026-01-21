/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import * as session from './actions/session';
import * as account from './actions/account';
import * as instruments from './actions/instruments';
import * as orders from './actions/orders';
import * as positions from './actions/positions';
import * as marketData from './actions/marketData';
import * as historicalData from './actions/historicalData';
import * as executions from './actions/executions';
import * as rejections from './actions/rejections';
import * as events from './actions/events';

export class Lmax implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LMAX',
		name: 'lmax',
		icon: 'file:lmax.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description:
			'Interact with LMAX Group trading platform for FX, CFD, and cryptocurrency trading',
		defaults: {
			name: 'LMAX',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'lmaxApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account',
						value: 'account',
						description: 'Manage account state and balances',
					},
					{
						name: 'Events',
						value: 'events',
						description: 'Poll and manage event streams',
					},
					{
						name: 'Executions',
						value: 'executions',
						description: 'View trade executions',
					},
					{
						name: 'Historical Data',
						value: 'historicalData',
						description: 'Retrieve historical market data',
					},
					{
						name: 'Instruments',
						value: 'instruments',
						description: 'Search and manage trading instruments',
					},
					{
						name: 'Market Data',
						value: 'marketData',
						description: 'Subscribe to and retrieve market data',
					},
					{
						name: 'Orders',
						value: 'orders',
						description: 'Place, amend, and cancel orders',
					},
					{
						name: 'Positions',
						value: 'positions',
						description: 'View and manage open positions',
					},
					{
						name: 'Rejections',
						value: 'rejections',
						description: 'View instruction rejections',
					},
					{
						name: 'Session',
						value: 'session',
						description: 'Manage API session',
					},
				],
				default: 'orders',
			},
			...session.description,
			...account.description,
			...instruments.description,
			...orders.description,
			...positions.description,
			...marketData.description,
			...historicalData.description,
			...executions.description,
			...rejections.description,
			...events.description,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Log licensing notice once per node execution
		this.logger.warn(
			'[Velocity BPA Licensing Notice] This n8n node is licensed under BSL 1.1. ' +
				'Use by for-profit organizations in production requires a commercial license. ' +
				'Visit https://velobpa.com/licensing for details.',
		);

		for (let i = 0; i < items.length; i++) {
			try {
				let results: INodeExecutionData[] = [];

				switch (resource) {
					case 'session':
						results = await executeSessionOperation(this, operation, i);
						break;
					case 'account':
						results = await executeAccountOperation(this, operation, i);
						break;
					case 'instruments':
						results = await executeInstrumentsOperation(this, operation, i);
						break;
					case 'orders':
						results = await executeOrdersOperation(this, operation, i);
						break;
					case 'positions':
						results = await executePositionsOperation(this, operation, i);
						break;
					case 'marketData':
						results = await executeMarketDataOperation(this, operation, i);
						break;
					case 'historicalData':
						results = await executeHistoricalDataOperation(this, operation, i);
						break;
					case 'executions':
						results = await executeExecutionsOperation(this, operation, i);
						break;
					case 'rejections':
						results = await executeRejectionsOperation(this, operation, i);
						break;
					case 'events':
						results = await executeEventsOperation(this, operation, i);
						break;
					default:
						throw new Error(`Unknown resource: ${resource}`);
				}

				returnData.push(...results);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

async function executeSessionOperation(
	context: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'login':
			return session.login.execute.call(context, index);
		case 'logout':
			return session.logout.execute.call(context, index);
		case 'heartbeat':
			return session.heartbeat.execute.call(context, index);
		case 'getVersion':
			return session.getVersion.execute.call(context, index);
		case 'validateSession':
			return session.validateSession.execute.call(context, index);
		default:
			throw new Error(`Unknown session operation: ${operation}`);
	}
}

async function executeAccountOperation(
	context: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getState':
			return account.getState.execute.call(context, index);
		case 'subscribe':
			return account.subscribe.execute.call(context, index);
		case 'unsubscribe':
			return account.unsubscribe.execute.call(context, index);
		case 'getWalletDetails':
			return account.getWalletDetails.execute.call(context, index);
		case 'getAccountDetails':
			return account.getAccountDetails.execute.call(context, index);
		case 'getTradingResources':
			return account.getTradingResources.execute.call(context, index);
		default:
			throw new Error(`Unknown account operation: ${operation}`);
	}
}

async function executeInstrumentsOperation(
	context: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'search':
			return instruments.search.execute.call(context, index);
		case 'getById':
			return instruments.getById.execute.call(context, index);
		case 'getAll':
			return instruments.getAll.execute.call(context, index);
		case 'getByAssetClass':
			return instruments.getByAssetClass.execute.call(context, index);
		case 'subscribe':
			return instruments.subscribe.execute.call(context, index);
		case 'unsubscribe':
			return instruments.unsubscribe.execute.call(context, index);
		default:
			throw new Error(`Unknown instruments operation: ${operation}`);
	}
}

async function executeOrdersOperation(
	context: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'placeLimitOrder':
			return orders.placeLimitOrder.execute.call(context, index);
		case 'placeMarketOrder':
			return orders.placeMarketOrder.execute.call(context, index);
		case 'placeStopOrder':
			return orders.placeStopOrder.execute.call(context, index);
		case 'cancelOrder':
			return orders.cancelOrder.execute.call(context, index);
		case 'amendOrder':
			return orders.amendOrder.execute.call(context, index);
		case 'amendStops':
			return orders.amendStops.execute.call(context, index);
		case 'getWorkingOrders':
			return orders.getWorkingOrders.execute.call(context, index);
		case 'getOrderById':
			return orders.getOrderById.execute.call(context, index);
		case 'closePosition':
			return orders.closePosition.execute.call(context, index);
		default:
			throw new Error(`Unknown orders operation: ${operation}`);
	}
}

async function executePositionsOperation(
	context: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getAll':
			return positions.getAll.execute.call(context, index);
		case 'getByInstrument':
			return positions.getByInstrument.execute.call(context, index);
		case 'subscribe':
			return positions.subscribe.execute.call(context, index);
		case 'unsubscribe':
			return positions.unsubscribe.execute.call(context, index);
		case 'closeAll':
			return positions.closeAll.execute.call(context, index);
		case 'closePartial':
			return positions.closePartial.execute.call(context, index);
		default:
			throw new Error(`Unknown positions operation: ${operation}`);
	}
}

async function executeMarketDataOperation(
	context: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'subscribeOrderBook':
			return marketData.subscribeOrderBook.execute.call(context, index);
		case 'unsubscribeOrderBook':
			return marketData.unsubscribeOrderBook.execute.call(context, index);
		case 'getTopOfBook':
			return marketData.getTopOfBook.execute.call(context, index);
		case 'getOrderBookDepth':
			return marketData.getOrderBookDepth.execute.call(context, index);
		case 'getLastTrade':
			return marketData.getLastTrade.execute.call(context, index);
		default:
			throw new Error(`Unknown marketData operation: ${operation}`);
	}
}

async function executeHistoricalDataOperation(
	context: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getTopOfBookHistory':
			return historicalData.getTopOfBookHistory.execute.call(context, index);
		case 'getAggregateHistory':
			return historicalData.getAggregateHistory.execute.call(context, index);
		case 'getTradeHistory':
			return historicalData.getTradeHistory.execute.call(context, index);
		case 'downloadHistoricalData':
			return historicalData.downloadHistoricalData.execute.call(context, index);
		default:
			throw new Error(`Unknown historicalData operation: ${operation}`);
	}
}

async function executeExecutionsOperation(
	context: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getAll':
			return executions.getAll.execute.call(context, index);
		case 'getByOrder':
			return executions.getByOrder.execute.call(context, index);
		case 'getByDateRange':
			return executions.getByDateRange.execute.call(context, index);
		case 'subscribe':
			return executions.subscribe.execute.call(context, index);
		case 'unsubscribe':
			return executions.unsubscribe.execute.call(context, index);
		default:
			throw new Error(`Unknown executions operation: ${operation}`);
	}
}

async function executeRejectionsOperation(
	context: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'getAll':
			return rejections.getAll.execute.call(context, index);
		case 'getByInstruction':
			return rejections.getByInstruction.execute.call(context, index);
		case 'subscribe':
			return rejections.subscribe.execute.call(context, index);
		case 'unsubscribe':
			return rejections.unsubscribe.execute.call(context, index);
		default:
			throw new Error(`Unknown rejections operation: ${operation}`);
	}
}

async function executeEventsOperation(
	context: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<INodeExecutionData[]> {
	switch (operation) {
		case 'poll':
			return events.poll.execute.call(context, index);
		case 'subscribe':
			return events.subscribe.execute.call(context, index);
		case 'unsubscribe':
			return events.unsubscribe.execute.call(context, index);
		case 'acknowledge':
			return events.acknowledge.execute.call(context, index);
		default:
			throw new Error(`Unknown events operation: ${operation}`);
	}
}

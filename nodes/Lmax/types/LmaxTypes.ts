/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export interface LmaxSession {
	sessionId: string;
	accountId: string;
	token: string;
	expiresAt: number;
}

export interface LmaxCredentials {
	username: string;
	password: string;
	environment: 'demo' | 'live';
	productType: 'CFD_DEMO' | 'CFD_LIVE' | 'CRYPTO_DEMO' | 'CRYPTO_LIVE';
}

export interface LmaxInstrument {
	id: number;
	name: string;
	assetClass: string;
	currency: string;
	unitOfMeasure: string;
	minimumOrderQuantity: number;
	orderQuantityIncrement: number;
	priceIncrement: number;
	tradingHours: string;
	margin: number;
	startTime?: string;
	stopTime?: string;
}

export interface LmaxOrder {
	instructionId: string;
	originalInstructionId?: string;
	instrumentId: number;
	accountId: number;
	quantity: number;
	matchedQuantity?: number;
	cancelledQuantity?: number;
	price?: number;
	stopLossOffset?: number;
	stopProfitOffset?: number;
	timeInForce: 'IOC' | 'FOK' | 'GTC' | 'GFD';
	orderType: 'LIMIT' | 'MARKET' | 'STOP';
	workingState?: string;
	timestamp?: string;
}

export interface LmaxPosition {
	instrumentId: number;
	accountId: number;
	openQuantity: number;
	openCost: number;
	cumulativeCost: number;
	shortUnfilledCost?: number;
	longUnfilledCost?: number;
}

export interface LmaxExecution {
	executionId: string;
	instructionId: string;
	orderId: string;
	instrumentId: number;
	accountId: number;
	price: number;
	quantity: number;
	timestamp: string;
	executionType: string;
	[key: string]: unknown;
}

export interface LmaxAccountState {
	accountId: number;
	balance: number;
	availableFunds: number;
	availableToWithdraw: number;
	unrealisedProfitAndLoss: number;
	margin: number;
	activeOrders: number;
	openPositions: number;
	currency: string;
}

export interface LmaxOrderBookEntry {
	price: number;
	quantity: number;
}

export interface LmaxOrderBook {
	instrumentId: number;
	timestamp: string;
	bids: LmaxOrderBookEntry[];
	asks: LmaxOrderBookEntry[];
	lastTradedPrice?: number;
	dailyHighestTradedPrice?: number;
	dailyLowestTradedPrice?: number;
}

export interface LmaxHistoricalDataPoint {
	timestamp: string;
	open: number;
	high: number;
	low: number;
	close: number;
	volume?: number;
}

export interface LmaxEvent {
	type: string;
	data: Record<string, unknown>;
	timestamp?: string;
	[key: string]: unknown;
}

export interface LmaxRejection {
	instructionId: string;
	reason: string;
	code: string;
	accountId: number;
	instrumentId?: number;
	timestamp: string;
	[key: string]: unknown;
}

export interface LmaxApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: {
		code: string;
		message: string;
		field?: string;
	};
}

export type LmaxResource =
	| 'session'
	| 'account'
	| 'instruments'
	| 'orders'
	| 'positions'
	| 'marketData'
	| 'historicalData'
	| 'executions'
	| 'rejections'
	| 'events';

export type SessionOperation =
	| 'login'
	| 'logout'
	| 'heartbeat'
	| 'getVersion'
	| 'validateSession';

export type AccountOperation =
	| 'getState'
	| 'subscribe'
	| 'unsubscribe'
	| 'getWalletDetails'
	| 'getAccountDetails'
	| 'getTradingResources';

export type InstrumentsOperation =
	| 'search'
	| 'getById'
	| 'getAll'
	| 'getByAssetClass'
	| 'subscribe'
	| 'unsubscribe';

export type OrdersOperation =
	| 'placeLimitOrder'
	| 'placeMarketOrder'
	| 'placeStopOrder'
	| 'cancelOrder'
	| 'amendOrder'
	| 'amendStops'
	| 'getWorkingOrders'
	| 'getOrderById'
	| 'closePosition';

export type PositionsOperation =
	| 'getAll'
	| 'getByInstrument'
	| 'subscribe'
	| 'unsubscribe'
	| 'closeAll'
	| 'closePartial';

export type MarketDataOperation =
	| 'subscribeOrderBook'
	| 'unsubscribeOrderBook'
	| 'getTopOfBook'
	| 'getOrderBookDepth'
	| 'getLastTrade';

export type HistoricalDataOperation =
	| 'getTopOfBookHistory'
	| 'getAggregateHistory'
	| 'getTradeHistory'
	| 'downloadHistoricalData';

export type ExecutionsOperation =
	| 'getAll'
	| 'getByOrder'
	| 'getByDateRange'
	| 'subscribe'
	| 'unsubscribe';

export type RejectionsOperation =
	| 'getAll'
	| 'getByInstruction'
	| 'subscribe'
	| 'unsubscribe';

export type EventsOperation = 'poll' | 'subscribe' | 'unsubscribe' | 'acknowledge';

export interface LmaxPaginationParams {
	offset?: number;
	limit?: number;
	from?: string;
	to?: string;
}

export interface LmaxErrorResponse {
	failureResponse: {
		message: string;
		code: string;
		field?: string;
		description?: string;
	};
}

export const LMAX_ERROR_CODES = {
	INVALID_CREDENTIALS: 'Invalid username or password',
	SESSION_EXPIRED: 'Session has timed out',
	INSTRUMENT_DOES_NOT_EXIST: 'Unknown instrument ID',
	INSTRUMENT_NOT_OPEN: 'Market is closed for this instrument',
	PRICE_NOT_VALID: 'Invalid price (wrong precision or out of range)',
	QUANTITY_NOT_VALID: 'Invalid quantity (below minimum or wrong precision)',
	EXPOSURE_CHECK_FAILURE: 'Insufficient margin or trading resources',
	DUPLICATE_ORDER: 'Instruction ID already used',
	UNKNOWN_ORDER: 'Order not found for cancel/amend',
	INVALID_MARKET_DEPTH: 'Requested depth exceeds maximum',
	INSUFFICIENT_LIQUIDITY: 'Not enough liquidity to fill order',
	INSTRUMENT_SUSPENSION: 'Instrument temporarily suspended',
	THROTTLE_LIMIT_EXCEEDED: 'Too many requests',
} as const;

export const LMAX_ASSET_CLASSES = ['CURRENCY', 'COMMODITY', 'INDEX', 'CRYPTO'] as const;
export type LmaxAssetClass = (typeof LMAX_ASSET_CLASSES)[number];

export const LMAX_TIME_IN_FORCE = ['IOC', 'FOK', 'GTC', 'GFD'] as const;
export type LmaxTimeInForce = (typeof LMAX_TIME_IN_FORCE)[number];

export const LMAX_ORDER_TYPES = ['LIMIT', 'MARKET', 'STOP'] as const;
export type LmaxOrderType = (typeof LMAX_ORDER_TYPES)[number];

export const LMAX_RESOLUTIONS = ['MINUTE', 'DAY'] as const;
export type LmaxResolution = (typeof LMAX_RESOLUTIONS)[number];

export const LMAX_EVENT_TYPES = [
	'orderBookEvent',
	'executionEvent',
	'orderEvent',
	'positionEvent',
	'accountStateEvent',
	'instructionRejectedEvent',
	'heartbeatEvent',
] as const;
export type LmaxEventType = (typeof LMAX_EVENT_TYPES)[number];

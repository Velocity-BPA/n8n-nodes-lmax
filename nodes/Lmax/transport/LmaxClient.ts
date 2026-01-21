/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHookFunctions,
	IWebhookFunctions,
	IHttpRequestOptions,
	IHttpRequestMethods,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import type { LmaxSession, LmaxCredentials, LmaxApiResponse } from '../types/LmaxTypes';
import { parseXmlResponse, buildXmlBody } from '../utils/xmlUtils';

const sessionCache: Map<string, LmaxSession> = new Map();

const LMAX_URLS = {
	live: 'https://trade.lmaxtrader.com',
	demo: 'https://testapi.lmaxtrader.com',
} as const;

export function getBaseUrl(environment: 'demo' | 'live'): string {
	return LMAX_URLS[environment];
}

export async function getCredentials(
	context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
): Promise<LmaxCredentials> {
	const credentials = await context.getCredentials('lmaxApi');
	return {
		username: credentials.username as string,
		password: credentials.password as string,
		environment: credentials.environment as 'demo' | 'live',
		productType: credentials.productType as
			| 'CFD_DEMO'
			| 'CFD_LIVE'
			| 'CRYPTO_DEMO'
			| 'CRYPTO_LIVE',
	};
}

export function getCacheKey(credentials: LmaxCredentials): string {
	return `${credentials.username}:${credentials.environment}:${credentials.productType}`;
}

export async function getSession(
	context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
): Promise<LmaxSession> {
	const credentials = await getCredentials(context);
	const cacheKey = getCacheKey(credentials);

	const cached = sessionCache.get(cacheKey);
	if (cached && cached.expiresAt > Date.now()) {
		return cached;
	}

	const baseUrl = getBaseUrl(credentials.environment);

	const loginOptions: IHttpRequestOptions = {
		method: 'POST',
		url: `${baseUrl}/public/security/login`,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Accept: 'application/xml',
		},
		body: `username=${encodeURIComponent(credentials.username)}&password=${encodeURIComponent(credentials.password)}&productType=${credentials.productType}`,
		returnFullResponse: true,
		ignoreHttpStatusErrors: true,
	};

	const response = await context.helpers.httpRequest(loginOptions);

	if (response.statusCode !== 200) {
		throw new NodeApiError(context.getNode(), {
			message: `LMAX login failed: ${response.body}`,
			httpCode: String(response.statusCode),
		});
	}

	const cookies = response.headers['set-cookie'] as string[] | string | undefined;
	const sessionId = extractSessionId(cookies);
	const accountId = extractAccountId(response.body as string);

	const session: LmaxSession = {
		sessionId,
		accountId,
		token: sessionId,
		expiresAt: Date.now() + 25 * 60 * 1000, // 25 minutes
	};

	sessionCache.set(cacheKey, session);
	return session;
}

function extractSessionId(cookies: string[] | string | undefined): string {
	if (!cookies) {
		throw new Error('No cookies in response');
	}

	const cookieArray = Array.isArray(cookies) ? cookies : [cookies];

	for (const cookie of cookieArray) {
		if (cookie.includes('JSESSIONID=')) {
			const match = cookie.match(/JSESSIONID=([^;]+)/);
			if (match) {
				return match[1];
			}
		}
	}
	throw new Error('Session ID not found in response cookies');
}

function extractAccountId(body: string): string {
	const match = body.match(/<accountId>(\d+)<\/accountId>/);
	if (match) {
		return match[1];
	}
	throw new Error('Account ID not found in login response');
}

export async function invalidateSession(
	context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
): Promise<void> {
	const credentials = await getCredentials(context);
	const cacheKey = getCacheKey(credentials);
	sessionCache.delete(cacheKey);
}

export async function lmaxApiRequest<T = unknown>(
	context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: Record<string, unknown>,
	query?: Record<string, string | number>,
	contentType: string = 'application/xml',
): Promise<LmaxApiResponse<T>> {
	const credentials = await getCredentials(context);
	const session = await getSession(context);
	const baseUrl = getBaseUrl(credentials.environment);

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}${endpoint}`,
		headers: {
			Accept: 'application/xml',
			'Content-Type': contentType,
			Cookie: `JSESSIONID=${session.sessionId}`,
		},
		returnFullResponse: true,
		ignoreHttpStatusErrors: true,
	};

	if (body && method !== 'GET') {
		if (contentType === 'application/xml') {
			options.body = buildXmlBody(body);
		} else {
			options.body = body;
			options.json = true;
		}
	}

	if (query) {
		options.qs = query;
	}

	try {
		const response = await context.helpers.httpRequest(options);

		if (response.statusCode === 401) {
			// Session expired, clear cache and retry once
			await invalidateSession(context);
			const newSession = await getSession(context);
			options.headers = {
				...options.headers,
				Cookie: `JSESSIONID=${newSession.sessionId}`,
			};
			const retryResponse = await context.helpers.httpRequest(options);
			return processResponse<T>(context, retryResponse);
		}

		return processResponse<T>(context, response);
	} catch (error) {
		throw new NodeApiError(context.getNode(), {
			message: (error as Error).message,
		});
	}
}

function processResponse<T>(
	context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions | IWebhookFunctions,
	response: {
		statusCode: number;
		body: string | Record<string, unknown>;
		headers: Record<string, unknown>;
	},
): LmaxApiResponse<T> {
	const body =
		typeof response.body === 'string'
			? response.body
			: JSON.stringify(response.body);

	if (response.statusCode >= 400) {
		const parsed = parseXmlResponse(body) as Record<string, unknown>;
		const failureResponse = parsed.failureResponse as Record<string, unknown> | undefined;
		if (failureResponse) {
			throw new NodeApiError(context.getNode(), {
				message: (failureResponse.message as string) || 'LMAX API error',
				description: failureResponse.description as string,
				httpCode: String(response.statusCode),
			});
		}
		throw new NodeApiError(context.getNode(), {
			message: `LMAX API error: ${body}`,
			httpCode: String(response.statusCode),
		});
	}

	const data = parseXmlResponse(body);

	return {
		success: true,
		data: data as T,
	};
}

export async function lmaxApiRequestAllItems<T = unknown>(
	context: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: Record<string, unknown>,
	query?: Record<string, string | number>,
	limit?: number,
): Promise<T[]> {
	const results: T[] = [];
	let offset = 0;
	const pageSize = 100;

	const maxItems = limit ?? 1000;

	while (results.length < maxItems) {
		const paginatedQuery = {
			...query,
			offset: String(offset),
			limit: String(Math.min(pageSize, maxItems - results.length)),
		};

		const response = await lmaxApiRequest<{ items?: T[]; data?: T[] }>(
			context,
			method,
			endpoint,
			body,
			paginatedQuery,
		);

		const items = response.data?.items ?? response.data?.data ?? [];
		if (!Array.isArray(items) || items.length === 0) {
			break;
		}

		results.push(...(items as T[]));

		if (items.length < pageSize) {
			break;
		}

		offset += pageSize;
	}

	return results;
}

export async function lmaxPollEvents(
	context: IExecuteFunctions | IHookFunctions | IWebhookFunctions,
	timeout: number = 30000,
): Promise<unknown[]> {
	const credentials = await getCredentials(context);
	const session = await getSession(context);
	const baseUrl = getBaseUrl(credentials.environment);

	const options: IHttpRequestOptions = {
		method: 'GET',
		url: `${baseUrl}/secure/read`,
		headers: {
			Accept: 'application/xml',
			Cookie: `JSESSIONID=${session.sessionId}`,
		},
		timeout,
		ignoreHttpStatusErrors: true,
	};

	try {
		const response = await context.helpers.httpRequest(options);
		const parsed = parseXmlResponse(response as string);
		return extractEvents(parsed);
	} catch (error) {
		if ((error as { code?: string }).code === 'ETIMEDOUT') {
			return [];
		}
		throw error;
	}
}

function extractEvents(response: Record<string, unknown>): unknown[] {
	const events: unknown[] = [];

	if (response.events && typeof response.events === 'object') {
		const eventTypes = [
			'orderBookEvent',
			'executionEvent',
			'orderEvent',
			'positionEvent',
			'accountStateEvent',
			'instructionRejectedEvent',
			'heartbeatEvent',
		];

		const eventsObj = response.events as Record<string, unknown>;

		for (const type of eventTypes) {
			if (eventsObj[type]) {
				const items = Array.isArray(eventsObj[type])
					? eventsObj[type]
					: [eventsObj[type]];
				events.push(
					...(items as unknown[]).map((item: unknown) => ({
						type,
						data: item,
					})),
				);
			}
		}
	}

	return events;
}

export function generateInstructionId(): string {
	return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export async function sendHeartbeat(
	context: IExecuteFunctions | IHookFunctions | IWebhookFunctions,
): Promise<boolean> {
	try {
		const credentials = await getCredentials(context);
		const session = await getSession(context);
		const baseUrl = getBaseUrl(credentials.environment);

		const options: IHttpRequestOptions = {
			method: 'POST',
			url: `${baseUrl}/secure/account/heartbeat`,
			headers: {
				Accept: 'application/xml',
				Cookie: `JSESSIONID=${session.sessionId}`,
			},
			ignoreHttpStatusErrors: true,
		};

		const response = await context.helpers.httpRequest(options);
		return response.statusCode === 200;
	} catch {
		return false;
	}
}

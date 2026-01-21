/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Parse XML response to JavaScript object
 * Simple XML parser for LMAX API responses
 */
export function parseXmlResponse(xml: string): Record<string, unknown> {
	if (!xml || typeof xml !== 'string') {
		return {};
	}

	// Remove XML declaration if present
	const content = xml.replace(/<\?xml[^?]*\?>/g, '').trim();

	if (!content) {
		return {};
	}

	try {
		return parseXmlElement(content);
	} catch {
		// If parsing fails, return raw content
		return { raw: xml };
	}
}

function parseXmlElement(xml: string): Record<string, unknown> {
	const result: Record<string, unknown> = {};

	// Match tags and their content
	const tagRegex = /<([a-zA-Z_][\w.-]*)([^>]*)>([\s\S]*?)<\/\1>|<([a-zA-Z_][\w.-]*)([^>]*)\/>/g;
	let match;

	while ((match = tagRegex.exec(xml)) !== null) {
		if (match[4]) {
			// Self-closing tag
			const tagName = match[4];
			const attrs = parseAttributes(match[5] || '');
			addToResult(result, tagName, Object.keys(attrs).length > 0 ? attrs : '');
		} else {
			// Regular tag
			const tagName = match[1];
			const attrs = parseAttributes(match[2] || '');
			const innerContent = match[3].trim();

			let value: unknown;

			if (!innerContent) {
				value = Object.keys(attrs).length > 0 ? attrs : '';
			} else if (innerContent.includes('<')) {
				// Has nested elements
				const nested = parseXmlElement(innerContent);
				value =
					Object.keys(attrs).length > 0 ? { ...attrs, ...nested } : nested;
			} else {
				// Text content
				const textValue = parseValue(innerContent);
				value =
					Object.keys(attrs).length > 0
						? { ...attrs, _text: textValue }
						: textValue;
			}

			addToResult(result, tagName, value);
		}
	}

	return result;
}

function parseAttributes(attrString: string): Record<string, string> {
	const attrs: Record<string, string> = {};
	const attrRegex = /([a-zA-Z_][\w.-]*)=["']([^"']*)["']/g;
	let match;

	while ((match = attrRegex.exec(attrString)) !== null) {
		attrs[`@${match[1]}`] = match[2];
	}

	return attrs;
}

function addToResult(
	result: Record<string, unknown>,
	key: string,
	value: unknown,
): void {
	if (key in result) {
		// Convert to array or push to existing array
		if (Array.isArray(result[key])) {
			(result[key] as unknown[]).push(value);
		} else {
			result[key] = [result[key], value];
		}
	} else {
		result[key] = value;
	}
}

function parseValue(value: string): string | number | boolean {
	// Try to parse as number
	const num = Number(value);
	if (!isNaN(num) && value !== '') {
		return num;
	}

	// Try to parse as boolean
	if (value.toLowerCase() === 'true') return true;
	if (value.toLowerCase() === 'false') return false;

	return value;
}

/**
 * Build XML body from JavaScript object
 */
export function buildXmlBody(
	data: Record<string, unknown>,
	rootName?: string,
): string {
	let xml = '<?xml version="1.0" encoding="UTF-8"?>';

	if (rootName) {
		xml += `<${rootName}>${objectToXml(data)}</${rootName}>`;
	} else {
		xml += objectToXml(data);
	}

	return xml;
}

function objectToXml(obj: unknown, tagName?: string): string {
	if (obj === null || obj === undefined) {
		return tagName ? `<${tagName}/>` : '';
	}

	if (typeof obj !== 'object') {
		const value = escapeXml(String(obj));
		return tagName ? `<${tagName}>${value}</${tagName}>` : value;
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => objectToXml(item, tagName)).join('');
	}

	let xml = '';
	const record = obj as Record<string, unknown>;

	// Handle attributes and text content
	const attrs: string[] = [];
	let textContent = '';

	for (const [key, value] of Object.entries(record)) {
		if (key.startsWith('@')) {
			// Attribute
			attrs.push(`${key.substring(1)}="${escapeXml(String(value))}"`);
		} else if (key === '_text') {
			// Text content
			textContent = escapeXml(String(value));
		} else if (Array.isArray(value)) {
			// Array - repeat tag for each item
			for (const item of value) {
				xml += objectToXml(item, key);
			}
		} else if (typeof value === 'object' && value !== null) {
			// Nested object
			xml += `<${key}>${objectToXml(value)}</${key}>`;
		} else if (value !== undefined && value !== null) {
			// Simple value
			xml += `<${key}>${escapeXml(String(value))}</${key}>`;
		}
	}

	if (tagName) {
		const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
		const content = xml + textContent;
		return content ? `<${tagName}${attrStr}>${content}</${tagName}>` : `<${tagName}${attrStr}/>`;
	}

	return xml + textContent;
}

function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/**
 * Convert LMAX timestamp to ISO format
 */
export function parseTimestamp(timestamp: string | number): string {
	if (typeof timestamp === 'number') {
		return new Date(timestamp).toISOString();
	}
	return new Date(timestamp).toISOString();
}

/**
 * Format date for LMAX API
 */
export function formatDateForApi(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toISOString();
}

/**
 * Extract specific data from LMAX response
 */
export function extractResponseData<T>(
	response: Record<string, unknown>,
	...paths: string[]
): T | undefined {
	for (const path of paths) {
		const keys = path.split('.');
		let current: unknown = response;

		for (const key of keys) {
			if (current && typeof current === 'object' && key in current) {
				current = (current as Record<string, unknown>)[key];
			} else {
				current = undefined;
				break;
			}
		}

		if (current !== undefined) {
			return current as T;
		}
	}

	return undefined;
}

/**
 * Ensure array format for response data
 */
export function ensureArray<T>(data: T | T[] | undefined): T[] {
	if (!data) return [];
	return Array.isArray(data) ? data : [data];
}

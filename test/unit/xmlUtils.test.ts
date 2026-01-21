/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { parseXmlResponse, buildXmlBody, extractResponseData, ensureArray } from '../../nodes/Lmax/utils/xmlUtils';

describe('xmlUtils', () => {
	describe('parseXmlResponse', () => {
		it('should parse simple XML', () => {
			const xml = '<root><value>test</value></root>';
			const result = parseXmlResponse(xml);
			expect(result).toHaveProperty('root');
		});

		it('should handle empty XML', () => {
			const xml = '<root></root>';
			const result = parseXmlResponse(xml);
			expect(result).toHaveProperty('root');
		});

		it('should handle nested XML', () => {
			const xml = '<root><parent><child>value</child></parent></root>';
			const result = parseXmlResponse(xml);
			expect(result).toHaveProperty('root');
		});
	});

	describe('buildXmlBody', () => {
		it('should build XML from object', () => {
			const data = { order: { price: 100 } };
			const result = buildXmlBody(data);
			expect(result).toContain('<?xml');
			expect(result).toContain('<order>');
			expect(result).toContain('<price>100</price>');
		});

		it('should handle arrays', () => {
			const data = { items: { item: ['a', 'b'] } };
			const result = buildXmlBody(data);
			expect(result).toContain('<item>a</item>');
			expect(result).toContain('<item>b</item>');
		});
	});

	describe('extractResponseData', () => {
		it('should extract nested data', () => {
			const data = { response: { orders: { order: [{ id: 1 }] } } };
			const result = extractResponseData(data, 'response.orders.order', 'order');
			expect(result).toEqual([{ id: 1 }]);
		});

		it('should handle missing paths', () => {
			const data = { response: {} };
			const result = extractResponseData(data, 'response.missing', 'default');
			expect(result).toBeUndefined();
		});
	});

	describe('ensureArray', () => {
		it('should wrap non-array in array', () => {
			const result = ensureArray({ id: 1 });
			expect(result).toEqual([{ id: 1 }]);
		});

		it('should return array as-is', () => {
			const result = ensureArray([{ id: 1 }, { id: 2 }]);
			expect(result).toEqual([{ id: 1 }, { id: 2 }]);
		});

		it('should return empty array for undefined', () => {
			const result = ensureArray(undefined);
			expect(result).toEqual([]);
		});

		it('should return empty array for null', () => {
			const result = ensureArray(null);
			expect(result).toEqual([]);
		});
	});
});

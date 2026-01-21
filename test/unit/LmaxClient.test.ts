/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { getBaseUrl, generateInstructionId, getCacheKey } from '../../nodes/Lmax/transport/LmaxClient';
import type { LmaxCredentials } from '../../nodes/Lmax/types/LmaxTypes';

describe('LmaxClient', () => {
	describe('getBaseUrl', () => {
		it('should return demo URL for demo environment', () => {
			const url = getBaseUrl('demo');
			expect(url).toBe('https://testapi.lmaxtrader.com');
		});

		it('should return live URL for live environment', () => {
			const url = getBaseUrl('live');
			expect(url).toBe('https://trade.lmaxtrader.com');
		});
	});

	describe('generateInstructionId', () => {
		it('should generate unique IDs', () => {
			const id1 = generateInstructionId();
			const id2 = generateInstructionId();
			expect(id1).not.toBe(id2);
		});

		it('should contain timestamp', () => {
			const id = generateInstructionId();
			const timestamp = id.split('-')[0];
			const now = Date.now();
			// Should be within 1 second
			expect(Math.abs(parseInt(timestamp) - now)).toBeLessThan(1000);
		});

		it('should have correct format', () => {
			const id = generateInstructionId();
			expect(id).toMatch(/^\d+-[a-z0-9]+$/);
		});
	});

	describe('getCacheKey', () => {
		it('should generate consistent cache key', () => {
			const credentials: LmaxCredentials = {
				username: 'testuser',
				password: 'testpass',
				environment: 'demo',
				productType: 'CFD_DEMO',
			};
			const key = getCacheKey(credentials);
			expect(key).toBe('testuser:demo:CFD_DEMO');
		});

		it('should differentiate by environment', () => {
			const demoCredentials: LmaxCredentials = {
				username: 'testuser',
				password: 'testpass',
				environment: 'demo',
				productType: 'CFD_DEMO',
			};
			const liveCredentials: LmaxCredentials = {
				username: 'testuser',
				password: 'testpass',
				environment: 'live',
				productType: 'CFD_LIVE',
			};
			expect(getCacheKey(demoCredentials)).not.toBe(getCacheKey(liveCredentials));
		});
	});
});

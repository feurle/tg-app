import { describe, expect, it } from 'vitest';
import { ApiError } from '../../lib/apiClient';
import { retryAfterMinutes } from './rateLimit';

describe('retryAfterMinutes', () => {
    it('rounds the wait of a rate-limited submission up to whole minutes', () => {
        expect(retryAfterMinutes(new ApiError(429, 'x', 421))).toBe(8);
        expect(retryAfterMinutes(new ApiError(429, 'x', 600))).toBe(10);
        expect(retryAfterMinutes(new ApiError(429, 'x', 1))).toBe(1);
    });

    it('is null for anything that is not a 429 with a wait time', () => {
        expect(retryAfterMinutes(new ApiError(500, 'x'))).toBeNull();
        expect(retryAfterMinutes(new ApiError(429, 'x'))).toBeNull();
        expect(retryAfterMinutes(new TypeError('Failed to fetch'))).toBeNull();
    });
});

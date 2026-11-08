import { ApiError } from '../../lib/apiClient';

/**
 * Minutes until a rate-limited form submission (429) may be sent again, rounded up.
 * Null for any other error, which keeps the form's generic error text.
 */
export function retryAfterMinutes(error: unknown): number | null {
    if (!(error instanceof ApiError) || error.status !== 429 || error.retryAfterSeconds === undefined) {
        return null;
    }
    return Math.max(1, Math.ceil(error.retryAfterSeconds / 60));
}

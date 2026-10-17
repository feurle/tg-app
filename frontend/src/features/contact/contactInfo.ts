import type { ContactInfoResponse } from './types';

const filled = (value: string | null | undefined): value is string => !!value && value.trim() !== '';

/** Street and "zip city" lines of the address; a line is `null` if its parts are missing. */
export function addressLines(info: ContactInfoResponse): { street: string | null; place: string | null } {
    const place = [info.zip, info.city].filter(filled).join(' ');
    return { street: filled(info.street) ? info.street : null, place: place || null };
}

/** Maps search link for the address, or `null` if there is nothing to search for. */
export function mapUrl(info: ContactInfoResponse): string | null {
    const { street, place } = addressLines(info);
    const query = [street, place].filter(filled).join(', ');
    return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;
}

export { filled };

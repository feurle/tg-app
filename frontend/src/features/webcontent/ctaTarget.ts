import { ROUTES } from '../../router/routes';

/** How a CTA button target (stored in `section.content`) is rendered. */
export type CtaTarget =
    | { kind: 'internal'; to: string }
    | { kind: 'external'; href: string };

export const CONTACT_APPOINTMENT = 'contact:appointment';
export const CONTACT_MESSAGE = 'contact:message';
export const CONTACT_REFERRAL = 'contact:referral';

const CONTACT_ROUTES: Record<string, string> = {
    [CONTACT_APPOINTMENT]: ROUTES.APPOINTMENT,
    [CONTACT_MESSAGE]: ROUTES.MESSAGE,
    [CONTACT_REFERRAL]: ROUTES.REFERRAL,
};

/**
 * Resolves a button target to something renderable, or `null` if it is not allowed. The same
 * rules are enforced by the backend on save; this is the re-check on render, because the value
 * ends up in an `href`.
 */
export function resolveCtaTarget(raw: string): CtaTarget | null {
    const value = raw.trim();
    if (value in CONTACT_ROUTES) return { kind: 'internal', to: CONTACT_ROUTES[value] };
    if (/\s/.test(value)) return null;
    if (value.startsWith('/') && !value.startsWith('//')) return { kind: 'internal', to: value };
    if (/^https?:\/\/\S+$/i.test(value)) return { kind: 'external', href: value };
    return null;
}

export function isValidCtaTarget(raw: string): boolean {
    return resolveCtaTarget(raw) !== null;
}

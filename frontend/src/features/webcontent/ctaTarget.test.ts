import { describe, expect, it } from 'vitest';
import { resolveCtaTarget } from './ctaTarget';

describe('resolveCtaTarget', () => {
    it('maps contact actions to their routes', () => {
        expect(resolveCtaTarget('contact:appointment')).toEqual({ kind: 'internal', to: '/appointment' });
        expect(resolveCtaTarget('contact:message')).toEqual({ kind: 'internal', to: '/message' });
    });

    it('accepts internal routes and http(s) URLs', () => {
        expect(resolveCtaTarget('/questionnaire')).toEqual({ kind: 'internal', to: '/questionnaire' });
        expect(resolveCtaTarget('https://example.com/a')).toEqual({ kind: 'external', href: 'https://example.com/a' });
    });

    it.each(['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,x', '//evil.example', 'contact:other', '/a b', ''])(
        'rejects %j',
        (value) => {
            expect(resolveCtaTarget(value)).toBeNull();
        },
    );
});

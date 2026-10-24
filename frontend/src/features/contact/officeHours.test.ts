import { describe, expect, it } from 'vitest';
import { getOpenStatus, groupByDay, sortOfficeHours, telHref } from './officeHours';
import type { OfficeHour } from './types';

const hours: OfficeHour[] = [
    { dayOfWeek: 'MONDAY', opensAt: '14:00:00', closesAt: '18:00:00' },
    { dayOfWeek: 'TUESDAY', opensAt: '14:00', closesAt: '18:00' },
    { dayOfWeek: 'TUESDAY', opensAt: '08:30', closesAt: '12:30' },
    { dayOfWeek: 'THURSDAY', opensAt: '08:30', closesAt: '12:30' },
];

// 2026-01-05 is a Monday. In January Vienna is UTC+1, in July (2026-07-06 is a Monday) UTC+2.
const vienna = (iso: string) => new Date(iso);

describe('getOpenStatus', () => {
    it('returns null without office hours', () => {
        expect(getOpenStatus([], vienna('2026-01-05T13:00:00Z'))).toBeNull();
    });

    it('is open inside an interval', () => {
        expect(getOpenStatus(hours, vienna('2026-01-05T14:00:00Z'))).toEqual({ kind: 'open', closesAt: '18:00:00' });
    });

    it('opens at the start and closes at the end of an interval', () => {
        // 14:00 Vienna = 13:00Z, 18:00 Vienna = 17:00Z
        expect(getOpenStatus(hours, vienna('2026-01-05T13:00:00Z'))?.kind).toBe('open');
        expect(getOpenStatus(hours, vienna('2026-01-05T16:59:00Z'))?.kind).toBe('open');
        expect(getOpenStatus(hours, vienna('2026-01-05T17:00:00Z'))?.kind).toBe('closed');
    });

    it('reports the next opening later the same day', () => {
        expect(getOpenStatus(hours, vienna('2026-01-05T10:00:00Z'))).toEqual({ kind: 'later', opensAt: '14:00:00' });
    });

    it('handles a break between two intervals on the same day', () => {
        // Tuesday 13:00 Vienna: between the morning and the afternoon interval
        expect(getOpenStatus(hours, vienna('2026-01-06T12:00:00Z'))).toEqual({ kind: 'later', opensAt: '14:00' });
    });

    it('points to the next open day when closed for the day', () => {
        expect(getOpenStatus(hours, vienna('2026-01-05T18:00:00Z'))).toEqual({
            kind: 'closed',
            next: { day: 'TUESDAY', opensAt: '08:30' },
        });
    });

    it('wraps around the week', () => {
        // Thursday evening -> Monday
        expect(getOpenStatus(hours, vienna('2026-01-08T20:00:00Z'))).toEqual({
            kind: 'closed',
            next: { day: 'MONDAY', opensAt: '14:00:00' },
        });
    });

    it('evaluates in Vienna time, not UTC, including daylight saving', () => {
        // 2026-07-06 12:30Z = 14:30 Vienna (UTC+2): open, whereas 12:30 UTC would be before opening
        expect(getOpenStatus(hours, vienna('2026-07-06T12:30:00Z'))?.kind).toBe('open');
        // 2026-07-06 21:30Z = 23:30 Vienna Monday, still Monday there
        expect(getOpenStatus(hours, vienna('2026-07-06T21:30:00Z'))?.kind).toBe('closed');
        // 2026-07-06 22:30Z = Tuesday 00:30 Vienna
        expect(getOpenStatus(hours, vienna('2026-07-06T22:30:00Z'))).toEqual({
            kind: 'later',
            opensAt: '08:30',
        });
    });
});

describe('sortOfficeHours / groupByDay', () => {
    it('orders by weekday, then by opening time', () => {
        expect(sortOfficeHours(hours).map((h) => `${h.dayOfWeek} ${h.opensAt}`)).toEqual([
            'MONDAY 14:00:00',
            'TUESDAY 08:30',
            'TUESDAY 14:00',
            'THURSDAY 08:30',
        ]);
    });

    it('groups intervals per day and skips days without hours', () => {
        const groups = groupByDay(hours);
        expect(groups.map((g) => g.day)).toEqual(['MONDAY', 'TUESDAY', 'THURSDAY']);
        expect(groups[1].intervals).toHaveLength(2);
    });
});

describe('telHref', () => {
    it('drops the optional (0) and spaces', () => {
        expect(telHref('+43 (0)5574 83500')).toBe('tel:+43557483500');
    });
});

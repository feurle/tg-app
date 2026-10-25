import { describe, expect, it } from 'vitest';
import {
    appointmentDays,
    appointmentSlots,
    appointmentTimes,
    getOpenStatus,
    groupByDay,
    practiceToday,
    sortOfficeHours,
    telHref,
} from './officeHours';
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

describe('appointment slots', () => {
    it('steps through each interval and stops one slot before closing', () => {
        expect(appointmentSlots(hours, 'MONDAY')).toEqual(['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']);
        expect(appointmentSlots(hours, 'THURSDAY')).toEqual(['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00']);
    });

    it('merges both intervals of a day in order', () => {
        const slots = appointmentSlots(hours, 'TUESDAY');
        expect(slots[0]).toBe('08:30');
        expect(slots).toContain('17:30');
        expect(slots).not.toContain('13:00');
    });

    it('has no slots on days without office hours', () => {
        expect(appointmentSlots(hours, 'WEDNESDAY')).toEqual([]);
    });
});

describe('appointmentTimes', () => {
    it('drops slots that have already passed today (Vienna time)', () => {
        // 2026-01-05 is a Monday; 15:10 Vienna = 14:10Z
        const now = new Date('2026-01-05T14:10:00Z');
        expect(appointmentTimes(hours, '2026-01-05', now)).toEqual(['15:30', '16:00', '16:30', '17:00', '17:30']);
    });

    it('offers all slots on a later date', () => {
        expect(appointmentTimes(hours, '2026-01-12', new Date('2026-01-05T14:10:00Z'))).toHaveLength(8);
    });
});

describe('appointmentDays', () => {
    const now = new Date('2026-01-05T09:00:00Z'); // Monday 10:00 Vienna

    it('lists only days with office hours inside the 8 week window', () => {
        const days = appointmentDays(hours, now);
        expect(days[0]).toBe('2026-01-05');
        expect(days[1]).toBe('2026-01-06');
        expect(days[2]).toBe('2026-01-08');
        expect(days).not.toContain('2026-01-07');
        expect(days[days.length - 1]).toBe('2026-03-02');
    });

    it('skips today once the last slot has passed', () => {
        // 17:45 Vienna
        expect(appointmentDays(hours, new Date('2026-01-05T16:45:00Z'))[0]).toBe('2026-01-06');
    });

    it('uses Vienna time for today near midnight', () => {
        // 2026-01-05 23:30Z is already Tuesday 00:30 in Vienna
        expect(practiceToday(new Date('2026-01-05T23:30:00Z'))).toBe('2026-01-06');
    });

    it('is empty without office hours', () => {
        expect(appointmentDays([], now)).toEqual([]);
    });
});

describe('telHref', () => {
    it('drops the optional (0) and spaces', () => {
        expect(telHref('+43 (0)5574 83500')).toBe('tel:+43557483500');
    });
});

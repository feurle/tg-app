import type { DayOfWeek, OfficeHour } from './types';

export const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

/** The practice is in Austria, so "today" and "now" are evaluated in Vienna time, not the visitor's. */
const PRACTICE_TIME_ZONE = 'Europe/Vienna';

export function formatTime(time: string): string {
    return time.slice(0, 5);
}

export function weekdayName(day: DayOfWeek, locale: string): string {
    // 2024-01-01 is a Monday.
    const date = new Date(Date.UTC(2024, 0, 1 + DAYS.indexOf(day)));
    return date.toLocaleDateString(locale, { weekday: 'long', timeZone: 'UTC' });
}

function minutes(time: string): number {
    const [h, m] = time.split(':');
    return Number(h) * 60 + Number(m);
}

/** Office hours ordered Monday to Sunday, then by opening time. */
export function sortOfficeHours(hours: OfficeHour[]): OfficeHour[] {
    return [...hours].sort(
        (a, b) => DAYS.indexOf(a.dayOfWeek) - DAYS.indexOf(b.dayOfWeek) || minutes(a.opensAt) - minutes(b.opensAt),
    );
}

/** Office hours grouped per weekday (Monday first); days without hours are left out. */
export function groupByDay(hours: OfficeHour[]): { day: DayOfWeek; intervals: OfficeHour[] }[] {
    const sorted = sortOfficeHours(hours);
    return DAYS.map((day) => ({ day, intervals: sorted.filter((h) => h.dayOfWeek === day) })).filter(
        (g) => g.intervals.length > 0,
    );
}

export type OpenStatus =
    | { kind: 'open'; closesAt: string }
    | { kind: 'later'; opensAt: string }
    | { kind: 'closed'; next: { day: DayOfWeek; opensAt: string } | null };

function practiceNow(now: Date): { day: DayOfWeek; minutes: number } {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: PRACTICE_TIME_ZONE,
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(now);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    return {
        day: get('weekday').toUpperCase() as DayOfWeek,
        minutes: Number(get('hour')) * 60 + Number(get('minute')),
    };
}

/** Whether the practice is open right now, opens later today, or when it opens next. `null` if no hours are set. */
export function getOpenStatus(hours: OfficeHour[], now: Date = new Date()): OpenStatus | null {
    if (hours.length === 0) return null;
    const sorted = sortOfficeHours(hours);
    const today = practiceNow(now);
    const todays = sorted.filter((h) => h.dayOfWeek === today.day);

    const current = todays.find((h) => minutes(h.opensAt) <= today.minutes && today.minutes < minutes(h.closesAt));
    if (current) return { kind: 'open', closesAt: current.closesAt };

    const later = todays.find((h) => minutes(h.opensAt) > today.minutes);
    if (later) return { kind: 'later', opensAt: later.opensAt };

    const todayIndex = DAYS.indexOf(today.day);
    for (let offset = 1; offset <= 7; offset++) {
        const day = DAYS[(todayIndex + offset) % 7];
        const first = sorted.find((h) => h.dayOfWeek === day);
        if (first) return { kind: 'closed', next: { day, opensAt: first.opensAt } };
    }
    return { kind: 'closed', next: null };
}

/** `tel:` target for a display number such as "+43 (0)5574 83500" (drops the optional "(0)" and spaces). */
export function telHref(phone: string): string {
    return `tel:${phone.replace(/\(0\)/g, '').replace(/[^\d+]/g, '')}`;
}

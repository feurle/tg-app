import { useEffect, useState } from 'react';

/** The current time, refreshed at the start of every minute so time-based labels flip on schedule. */
export function useNow(): Date {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        let timer: number;
        const schedule = () => {
            const current = new Date();
            setNow(current);
            timer = window.setTimeout(schedule, 60_000 - (current.getTime() % 60_000));
        };
        timer = window.setTimeout(schedule, 60_000 - (Date.now() % 60_000));
        return () => window.clearTimeout(timer);
    }, []);

    return now;
}

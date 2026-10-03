import { useEffect, useState } from 'react';
import { contactApi } from './api';
import type { ContactInfoResponse } from './types';

let cached: Promise<ContactInfoResponse | null> | null = null;

function load(): Promise<ContactInfoResponse | null> {
    cached ??= contactApi.getPrimary().catch(() => {
        cached = null;
        return null;
    });
    return cached;
}

/** The practice's public contact data (primary VetInfo); `null` while loading or if none exists. Fetched once per page load. */
export function useVetInfo(): ContactInfoResponse | null {
    const [info, setInfo] = useState<ContactInfoResponse | null>(null);

    useEffect(() => {
        let cancelled = false;
        load().then((data) => {
            if (!cancelled) setInfo(data);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    return info;
}

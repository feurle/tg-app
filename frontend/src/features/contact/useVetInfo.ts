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

export interface VetInfoState {
    info: ContactInfoResponse | null;
    /** `false` until the request has finished, successfully or not. */
    loaded: boolean;
}

/** Contact data of the practice (primary VetInfo) plus whether loading has finished. Fetched once per page load. */
export function useVetInfoState(): VetInfoState {
    const [state, setState] = useState<VetInfoState>({ info: null, loaded: false });

    useEffect(() => {
        let cancelled = false;
        load().then((info) => {
            if (!cancelled) setState({ info, loaded: true });
        });
        return () => {
            cancelled = true;
        };
    }, []);

    return state;
}

/** The practice's contact data; `null` while loading or if none exists. */
export function useVetInfo(): ContactInfoResponse | null {
    return useVetInfoState().info;
}

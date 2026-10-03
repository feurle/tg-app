export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

/** One opening interval; times are `HH:mm` or `HH:mm:ss`. A day with a break has two entries. */
export interface OfficeHour {
    dayOfWeek: DayOfWeek;
    opensAt: string;
    closesAt: string;
}

/** The API accepts incomplete records, so every contact field may be missing. */
export interface ContactInfoResponse {
    id: number;
    name: string | null;
    primary: boolean;
    phone: string | null;
    email: string | null;
    street: string | null;
    city: string | null;
    zip: string | null;
    officeHours: OfficeHour[];
    updatedAt: string;
}

export interface SendMessageRequest {
    title: string;
    text: string;
    replyToEmail: string;
    senderName: string;
}

export interface RequestAppointmentRequest {
    senderName: string;
    replyToEmail: string;
    /** Optional — omitted when the visitor leaves it blank. */
    phone?: string;
    /** ISO date, `yyyy-MM-dd`. */
    preferredDate: string;
    /** Optional 24h time, `HH:mm`. */
    preferredTime?: string;
    text?: string;
}

export interface ContactInfoFormData {
    name: string;
    primary: boolean;
    phone: string;
    email: string;
    street: string;
    city: string;
    zip: string;
    officeHours: OfficeHour[];
}

export type ReferralUrgency = 'ROUTINE' | 'SOON' | 'URGENT';

/** Optional fields are omitted when left blank. */
export interface RequestReferralRequest {
    referringPractice: string;
    referringVetName: string;
    referringEmail: string;
    referringPhone?: string;
    ownerName: string;
    ownerContact: string;
    patientName?: string;
    species: string;
    breed?: string;
    age?: string;
    question: string;
    previousTreatment?: string;
    urgency: ReferralUrgency;
    ownerConsent: boolean;
}

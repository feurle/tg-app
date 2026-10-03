export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

/** One opening interval; times are `HH:mm` or `HH:mm:ss`. A day with a break has two entries. */
export interface OfficeHour {
    dayOfWeek: DayOfWeek;
    opensAt: string;
    closesAt: string;
}

export interface ContactInfoResponse {
    id: number;
    name: string;
    primary: boolean;
    phone: string;
    email: string;
    street: string;
    city: string;
    zip: string;
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

export interface OfficeHour {
    label: string;
    hours: string;
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

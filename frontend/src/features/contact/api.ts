import apiClient from '../../lib/apiClient';
import type {
    ContactInfoResponse,
    ContactInfoFormData,
    RequestAppointmentRequest,
    RequestReferralRequest,
    SendMessageRequest,
} from './types';

export const contactApi = {
    sendMessage: (data: SendMessageRequest) => apiClient.post<void>('/api/contact/message', data),
    requestAppointment: (data: RequestAppointmentRequest) =>
        apiClient.post<void>('/api/contact/appointment', data),
    requestReferral: (data: RequestReferralRequest) => apiClient.post<void>('/api/contact/referral', data),
    /** Public contact data of the practice (the primary VetInfo). */
    getPrimary: () => apiClient.get<ContactInfoResponse>('/api/vetinfo/primary'),
    getAll: () => apiClient.get<ContactInfoResponse[]>('/api/vetinfo'),
    create: (data: ContactInfoFormData) => apiClient.post<ContactInfoResponse>('/api/vetinfo', data),
    update: (id: number, data: ContactInfoFormData) => apiClient.put<ContactInfoResponse>(`/api/vetinfo/${id}`, data),
    delete: (id: number) => apiClient.delete<void>(`/api/vetinfo/${id}`),
};

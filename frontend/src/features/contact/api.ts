import apiClient from '../../lib/apiClient';
import type {
    ContactInfoResponse,
    ContactInfoFormData,
    RequestAppointmentRequest,
    SendMessageRequest,
} from './types';

export const contactApi = {
    sendMessage: (data: SendMessageRequest) => apiClient.post<void>('/api/contact/message', data),
    requestAppointment: (data: RequestAppointmentRequest) =>
        apiClient.post<void>('/api/contact/appointment', data),
    getInfo: () => apiClient.get<ContactInfoResponse>('/api/contact/info'),
    getAll: () => apiClient.get<ContactInfoResponse[]>('/api/contact/info'),
    create: (data: ContactInfoFormData) => apiClient.post<ContactInfoResponse>('/api/contact/info', data),
    update: (id: number, data: ContactInfoFormData) => apiClient.put<ContactInfoResponse>(`/api/contact/info/${id}`, data),
    delete: (id: number) => apiClient.delete<void>(`/api/contact/info/${id}`),
};

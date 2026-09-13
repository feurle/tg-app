import apiClient from '../../lib/apiClient';
import type { Customer, CustomerFormData } from './types';

const BASE = '/api/customer';

export const customerApi = {
  getAll: () => apiClient.get<Customer[]>(BASE),
  create: (data: CustomerFormData) => apiClient.post<Customer>(BASE, data),
  update: (id: number, data: CustomerFormData) => apiClient.put<Customer>(`${BASE}/${id}`, data),
  delete: (id: number) => apiClient.delete<void>(`${BASE}/${id}`),
};

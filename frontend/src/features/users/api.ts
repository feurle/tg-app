import apiClient from '../../lib/apiClient';
import type { CreateUserData, UpdateUserData, User } from './types';

const BASE = '/api/user';

export const userApi = {
  getAll: () => apiClient.get<User[]>(BASE),
  create: (data: CreateUserData) => apiClient.post<User>(BASE, data),
  update: (id: number, data: UpdateUserData) => apiClient.put<User>(`${BASE}/${id}`, data),
  delete: (id: number) => apiClient.delete<void>(`${BASE}/${id}`),
};

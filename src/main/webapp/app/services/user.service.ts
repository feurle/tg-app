import { api } from './api'
import type { User, CreateUserData, UpdateUserData } from '../types/user'

export const userService = {
  async getAll(): Promise<User[]> {
    return api.get<User[]>('/user')
  },

  async getById(id: number): Promise<User> {
    return api.get<User>(`/user/${id}`)
  },

  async create(data: CreateUserData): Promise<User> {
    return api.post<User>('/user', data)
  },

  async update(id: number, data: UpdateUserData): Promise<User> {
    return api.put<User>(`/user/${id}`, data)
  },

  async remove(id: number): Promise<void> {
    return api.delete(`/user/${id}`)
  },
}

import { api } from './api'
import type { Customer, CreateCustomerData, UpdateCustomerData } from '../types/customer'

export const customerService = {
  async getAll(): Promise<Customer[]> {
    return api.get<Customer[]>('/customer')
  },

  async getById(id: number): Promise<Customer> {
    return api.get<Customer>(`/customer/${id}`)
  },

  async create(data: CreateCustomerData): Promise<Customer> {
    return api.post<Customer>('/customer', data)
  },

  async update(id: number, data: UpdateCustomerData): Promise<Customer> {
    return api.put<Customer>(`/customer/${id}`, data)
  },

  async remove(id: number): Promise<void> {
    return api.delete(`/customer/${id}`)
  },
}

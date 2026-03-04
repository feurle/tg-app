import { useState, useEffect } from 'react'
import { customerService } from '../services/customer.service'
import type { Customer, CreateCustomerData, UpdateCustomerData } from '../types/customer'

interface UseCustomersResult {
  customers: Customer[]
  loading: boolean
  error: string | null
  create: (data: CreateCustomerData) => Promise<Customer>
  update: (id: number, data: UpdateCustomerData) => Promise<Customer>
  remove: (id: number) => Promise<void>
  reload: () => Promise<void>
}

export function useCustomers(): UseCustomersResult {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = async () => {
    try {
      setError(null)
      const data = await customerService.getAll()
      setCustomers(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch customers'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const create = async (data: CreateCustomerData): Promise<Customer> => {
    const result = await customerService.create(data)
    await fetchCustomers()
    return result
  }

  const update = async (id: number, data: UpdateCustomerData): Promise<Customer> => {
    const result = await customerService.update(id, data)
    await fetchCustomers()
    return result
  }

  const remove = async (id: number): Promise<void> => {
    await customerService.remove(id)
    await fetchCustomers()
  }

  return {
    customers,
    loading,
    error,
    create,
    update,
    remove,
    reload: fetchCustomers,
  }
}

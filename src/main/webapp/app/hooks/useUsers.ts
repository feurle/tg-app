import { useState, useEffect } from 'react'
import { userService } from '../services/user.service'
import type { User, CreateUserData, UpdateUserData } from '../types/user'

interface UseUsersResult {
  users: User[]
  loading: boolean
  error: string | null
  create: (data: CreateUserData) => Promise<User>
  update: (id: number, data: UpdateUserData) => Promise<User>
  remove: (id: number) => Promise<void>
  reload: () => Promise<void>
}

export function useUsers(): UseUsersResult {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setError(null)
      const data = await userService.getAll()
      setUsers(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch users'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const create = async (data: CreateUserData): Promise<User> => {
    const result = await userService.create(data)
    await fetchUsers()
    return result
  }

  const update = async (id: number, data: UpdateUserData): Promise<User> => {
    const result = await userService.update(id, data)
    await fetchUsers()
    return result
  }

  const remove = async (id: number): Promise<void> => {
    await userService.remove(id)
    await fetchUsers()
  }

  return {
    users,
    loading,
    error,
    create,
    update,
    remove,
    reload: fetchUsers,
  }
}

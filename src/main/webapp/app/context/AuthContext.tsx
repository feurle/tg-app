/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { authService } from '../services/auth.service'
import type { AuthUser } from '../types/auth'

interface AuthContextType {
  authUser: AuthUser | null | 'loading'
  login: (login: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null | 'loading'>('loading')

  // Hydrate auth state on mount
  useEffect(() => {
    ;(async () => {
      try {
        const user = await authService.getMe()
        setAuthUser(user)
      } catch {
        setAuthUser(null)
      }
    })()
  }, [])

  const login = async (login: string, password: string) => {
    try {
      await authService.login(login, password)
      const user = await authService.getMe()
      setAuthUser(user)
    } catch (error) {
      setAuthUser(null)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      setAuthUser(null)
    }
  }

  const value: AuthContextType = {
    authUser,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}

export { useAuthContext }

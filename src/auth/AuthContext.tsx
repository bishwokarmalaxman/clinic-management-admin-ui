import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import client from '../api/client'

interface AuthUser {
  token: string
  role: string
  doctorId?: number
  username: string
}

interface AuthContextValue {
  user: AuthUser | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem('hf_auth')
    if (!raw) return null
    try { return JSON.parse(raw) } catch { return null }
  })

  async function login(username: string, password: string) {
    const res = await client.post('/auth/login', { username, password })
    const userData: AuthUser = {
      token: res.data.token,
      role: res.data.role,
      doctorId: res.data.doctorId ?? undefined,
      username: res.data.username ?? username,
    }
    localStorage.setItem('hf_auth', JSON.stringify(userData))
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('hf_auth')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

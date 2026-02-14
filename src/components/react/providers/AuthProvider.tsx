import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi, userApi } from '../../../services/api'

interface User {
  id: string
  email: string
  displayName: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (data: Record<string, unknown>) => Promise<User>
  logout: () => void
  isAdmin: boolean
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

function readCachedAuth() {
  try {
    const cachedUser = localStorage.getItem('cachedUser')
    const lastCheck = localStorage.getItem('authCheckedAt')
    const user = cachedUser ? JSON.parse(cachedUser) as User : null
    const isFresh = !!(user && lastCheck && Date.now() - Number(lastCheck) < 5 * 60 * 1000)
    return { user, isFresh }
  } catch {
    return { user: null, isFresh: false }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readCachedAuth().user)
  const [loading, setLoading] = useState(() => !readCachedAuth().isFresh)

  useEffect(() => {
    if (loading) checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      try {
        const response = await userApi.getMe()
        setUser(response.data)
        localStorage.setItem('cachedUser', JSON.stringify(response.data))
        localStorage.setItem('authCheckedAt', String(Date.now()))
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('cachedUser')
        localStorage.removeItem('authCheckedAt')
        setUser(null)
      }
    } else {
      setUser(null)
      localStorage.removeItem('cachedUser')
      localStorage.removeItem('authCheckedAt')
    }
    setLoading(false)
  }

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    const { accessToken, refreshToken, user: userData } = response.data

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('cachedUser', JSON.stringify(userData))
    localStorage.setItem('authCheckedAt', String(Date.now()))
    setUser(userData)

    return userData
  }

  const register = async (data: Record<string, unknown>) => {
    const response = await authApi.register(data)
    const { accessToken, refreshToken, user: userData } = response.data

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('cachedUser', JSON.stringify(userData))
    localStorage.setItem('authCheckedAt', String(Date.now()))
    setUser(userData)

    return userData
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('cachedUser')
    localStorage.removeItem('authCheckedAt')
    setUser(null)
    window.location.href = '/app/login'
  }

  const isAdmin = user?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

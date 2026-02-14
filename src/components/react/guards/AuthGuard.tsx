import { useAuth } from '../providers/AuthProvider'
import type { ReactNode } from 'react'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-intense-pink" />
      </div>
    )
  }

  if (!user) {
    window.location.href = '/app/login'
    return null
  }

  return <>{children}</>
}

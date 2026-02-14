import { useAuth } from '../providers/AuthProvider'
import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin } = useAuth()

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

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

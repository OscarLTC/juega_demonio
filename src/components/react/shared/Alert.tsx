import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle'
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle'
import Info from 'lucide-react/dist/esm/icons/info'
import XCircle from 'lucide-react/dist/esm/icons/x-circle'
import type { ReactNode } from 'react'

const variants = {
  success: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    text: 'text-green-400',
    icon: CheckCircle,
  },
  error: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: XCircle,
  },
  warning: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    icon: AlertCircle,
  },
  info: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: Info,
  },
}

interface AlertProps {
  variant?: keyof typeof variants
  children: ReactNode
  className?: string
}

export default function Alert({ variant = 'info', children, className = '' }: AlertProps) {
  const { bg, border, text, icon: Icon } = variants[variant]

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${bg} ${border} ${text} ${className}`}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">{children}</div>
    </div>
  )
}

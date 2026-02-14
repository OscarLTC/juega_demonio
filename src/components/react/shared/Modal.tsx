import X from 'lucide-react/dist/esm/icons/x'
import type { ReactNode } from 'react'

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: keyof typeof sizeClasses
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/70 transition-opacity"
          onClick={onClose}
        />

        <div
          className={`relative bg-dark border border-charcoal/30 rounded-xl shadow-xl w-full transform transition-all ${sizeClasses[size]}`}
        >
          <div className="flex items-center justify-between p-4 border-b border-charcoal/30">
            <h3 className="text-lg font-semibold text-light-gray">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  )
}

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
          className="fixed inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity"
          onClick={onClose}
        />

        <div
          className={`relative bg-dark border border-charcoal/20 rounded-xl shadow-2xl w-full transform transition-all overflow-hidden ${sizeClasses[size]}`}
        >
          {/* Accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-intense-pink/30 to-transparent" />

          {title ? (
            <div className="flex items-center justify-between p-5 border-b border-charcoal/15">
              <h3
                className="text-lg font-bold text-light-gray tracking-wide uppercase"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/8 transition-colors text-dark-gray hover:text-gray"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 p-2 rounded-lg hover:bg-white/8 transition-colors text-dark-gray hover:text-gray"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  )
}

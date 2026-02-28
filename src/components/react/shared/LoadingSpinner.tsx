interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4 border-[1.5px]',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-2',
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-intense-pink/20 border-t-intense-pink ${sizeClasses[size]}`}
      />
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  message: string
  type: ToastType
  duration?: number
  onClose?: () => void
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info
}

const colors = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: 'text-green-600'
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: 'text-red-600'
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: 'text-yellow-600'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'text-blue-600'
  }
}

export function Toast({ message, type, duration, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true)

    // Only set auto-dismiss timer if duration is provided
    if (duration) {
      const timer = setTimeout(() => {
        setIsExiting(true)
        setTimeout(() => {
          onClose?.()
        }, 300) // Wait for exit animation
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const Icon = icons[type]
  const color = colors[type]

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div
        className={`
          flex items-center p-4 rounded-lg shadow-lg border
          ${color.bg} ${color.border} ${color.text}
        `}
      >
        <Icon className={`h-5 w-5 mr-3 ${color.icon}`} />
        <p className="text-sm font-medium">{message}</p>
        {onClose && (
          <button
            onClick={() => {
              setIsExiting(true)
              setTimeout(() => onClose(), 300)
            }}
            className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg transition-all duration-200"
            style={{ color: '#6b7280' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#dc2626'
              e.currentTarget.style.transform = 'scale(1.01)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6b7280'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default Toast

'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border transition-all duration-300 hover:scale-105"
      style={{
        backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
        color: theme === 'dark' ? '#f9fafb' : '#111827'
      }}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" style={{ color: '#fbbf24' }} />
      ) : (
        <Moon className="h-5 w-5" style={{ color: '#6366f1' }} />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}

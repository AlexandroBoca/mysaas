'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme)
    } else {
      // Check system preference
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setTheme(systemPreference)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    // Apply theme to document
    const root = window.document.documentElement
    console.log('Applying theme:', theme) // Debug log
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    
    // Direct body manipulation as backup
    const body = window.document.body
    if (theme === 'dark') {
      body.style.backgroundColor = '#111827'
    } else {
      body.style.backgroundColor = '#ffffff'
    }
    
    // Save theme preference
    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  const toggleTheme = () => {
    console.log('Toggling theme from', theme, 'to', theme === 'light' ? 'dark' : 'light') // Debug log
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  // Prevent flash of incorrect theme
  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Theme constants with improved contrast and accessibility
export const THEME_COLORS = {
  // Background colors
  background: {
    primary: {
      light: '#ffffff',
      dark: '#111827'
    },
    secondary: {
      light: '#f9fafb',
      dark: '#1f2937'
    },
    tertiary: {
      light: '#f3f4f6',
      dark: '#374151'
    }
  },
  
  // Text colors with improved contrast
  text: {
    primary: {
      light: '#111827', // Near black for high contrast
      dark: '#f9fafb'  // Near white for high contrast
    },
    secondary: {
      light: '#374151', // Darker gray for better contrast
      dark: '#d1d5db'  // Lighter gray for better contrast
    },
    tertiary: {
      light: '#6b7280', // Medium gray
      dark: '#9ca3af'  // Light gray
    },
    muted: {
      light: '#9ca3af', // Light gray
      dark: '#6b7280'  // Medium gray
    }
  },
  
  // Border colors
  border: {
    primary: {
      light: '#d1d5db', // Standard border
      dark: '#4b5563'  // Medium border
    },
    secondary: {
      light: '#e5e7eb', // Light border
      dark: '#374151'  // Dark border
    },
    focus: {
      light: '#3b82f6', // Blue focus
      dark: '#60a5fa'  // Lighter blue for dark mode
    },
    hover: {
      light: '#9ca3af', // Hover state
      dark: '#6b7280'  // Hover state for dark
    }
  },
  
  // Input styles
  input: {
    border: {
      light: '2px solid #d1d5db', // Thicker border for light mode
      dark: '1px solid #4b5563'   // Standard border for dark mode
    },
    focus: {
      light: '2px solid #3b82f6', // Thicker focus border
      dark: '2px solid #60a5fa'   // Consistent thickness
    },
    background: {
      light: '#ffffff',
      dark: '#374151'
    },
    text: {
      light: '#111827',
      dark: '#f9fafb'
    },
    placeholder: {
      light: '#9ca3af', // Medium gray for light mode
      dark: '#6b7280'  // Darker gray for better contrast in dark mode
    }
  },
  
  // Button colors
  button: {
    primary: {
      background: {
        light: '#3b82f6',
        dark: '#2563eb'
      },
      hover: {
        light: '#2563eb',
        dark: '#1d4ed8'
      },
      text: '#ffffff'
    },
    secondary: {
      background: {
        light: '#f3f4f6',
        dark: '#374151'
      },
      hover: {
        light: '#e5e7eb',
        dark: '#4b5563'
      },
      text: {
        light: '#374151',
        dark: '#f9fafb'
      }
    }
  },
  
  // Status colors
  status: {
    success: {
      light: '#059669',
      dark: '#10b981'
    },
    warning: {
      light: '#d97706',
      dark: '#f59e0b'
    },
    error: {
      light: '#dc2626',
      dark: '#ef4444'
    },
    info: {
      light: '#2563eb',
      dark: '#3b82f6'
    }
  }
} as const

// Helper function to get theme color
export const getThemeColor = (theme: 'light' | 'dark') => ({
  background: {
    primary: THEME_COLORS.background.primary[theme],
    secondary: THEME_COLORS.background.secondary[theme],
    tertiary: THEME_COLORS.background.tertiary[theme]
  },
  text: {
    primary: THEME_COLORS.text.primary[theme],
    secondary: THEME_COLORS.text.secondary[theme],
    tertiary: THEME_COLORS.text.tertiary[theme],
    muted: THEME_COLORS.text.muted[theme]
  },
  border: {
    primary: THEME_COLORS.border.primary[theme],
    secondary: THEME_COLORS.border.secondary[theme],
    focus: THEME_COLORS.border.focus[theme],
    hover: THEME_COLORS.border.hover[theme]
  },
  input: THEME_COLORS.input,
  button: THEME_COLORS.button,
  status: THEME_COLORS.status
})

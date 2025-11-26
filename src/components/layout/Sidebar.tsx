'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  FileText, 
  FolderOpen, 
  Settings, 
  CreditCard, 
  User, 
  LogOut,
  Menu,
  X,
  Zap,
  PenTool,
  Mail,
  MessageSquare,
  BarChart3
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: FileText, label: 'Projects', href: '/projects' },
  { icon: FolderOpen, label: 'Templates', href: '/templates' },
  { icon: PenTool, label: 'Writer', href: '/writer' },
  { icon: Mail, label: 'Email Generator', href: '/email' },
  { icon: MessageSquare, label: 'Social Media', href: '/social' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
]

const settingsItems = [
  { icon: User, label: 'Profile', href: '/profile' },
  { icon: CreditCard, label: 'Billing', href: '/billing' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export default function Sidebar({ user }: { user: any }) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { theme } = useTheme()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 
          ${isCollapsed ? 'w-16' : 'w-64'} 
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 
          border-r transition-all duration-200 ease-out
          flex flex-col
          group
        `}
        style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
        }}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b transition-colors duration-300"
          style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
        >
          <div className={`transition-all duration-200 ease-out ${isCollapsed ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span 
                  className="font-bold transition-colors duration-300"
                  style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                >
                  AI Writer
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1 rounded-md transition-colors duration-300"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
            >
              <X className="h-5 w-5" />
            </button>
            
            {/* Desktop icon when collapsed */}
            <div className={`hidden lg:block transition-all duration-200 ease-out ${isCollapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              {isCollapsed && (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main Menu */}
          <div className="space-y-1">
            <div className={`transition-all duration-200 ease-out ${isCollapsed ? 'opacity-0 scale-95 h-0 overflow-hidden' : 'opacity-100 scale-100'}`}>
              <h3 
                className="text-xs font-semibold uppercase tracking-wider mb-3 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
              >
                Main
              </h3>
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-out
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  style={{
                    backgroundColor: isActive 
                      ? (theme === 'dark' ? '#1e3a8a' : '#f3f4f6')
                      : 'transparent',
                    color: isActive
                      ? (theme === 'dark' ? '#93c5fd' : '#000000')
                      : (theme === 'dark' ? '#d1d5db' : '#000000')
                  }}
                  title={isCollapsed ? item.label : ''}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6'
                      e.currentTarget.style.color = theme === 'dark' ? '#f9fafb' : '#111827'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#374151'
                    }
                  }}
                >
                  <div className={`
                    flex items-center justify-center
                    ${isActive ? 'w-5 h-5 rounded-md' : 'w-5 h-5'}
                  `}
                  style={{
                    backgroundColor: 'transparent'
                  }}
                  >
                    <Icon 
                      className="h-5 w-5 flex-shrink-0" 
                      style={{
                        color: isActive 
                          ? (theme === 'dark' ? '#dbeafe' : '#000000')
                          : (theme === 'dark' ? '#d1d5db' : '#000000')
                      }}
                    />
                  </div>
                  <span className={`ml-3 transition-all duration-200 ease-out ${isCollapsed ? 'opacity-0 scale-95 w-0 overflow-hidden' : 'opacity-100 scale-100'}`}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Settings */}
          <div className="space-y-1">
            <div className={`transition-all duration-200 ease-out ${isCollapsed ? 'opacity-0 scale-95 h-0 overflow-hidden' : 'opacity-100 scale-100'}`}>
              <h3 
                className="text-xs font-semibold uppercase tracking-wider mb-3 transition-colors duration-300"
                style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
              >
                Settings
              </h3>
            </div>
            {settingsItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-out
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  style={{
                    backgroundColor: isActive 
                      ? (theme === 'dark' ? '#1e3a8a' : '#f3f4f6')
                      : 'transparent',
                    color: isActive
                      ? (theme === 'dark' ? '#93c5fd' : '#000000')
                      : (theme === 'dark' ? '#d1d5db' : '#000000')
                  }}
                  title={isCollapsed ? item.label : ''}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6'
                      e.currentTarget.style.color = theme === 'dark' ? '#f9fafb' : '#111827'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#374151'
                    }
                  }}
                >
                  <div className={`
                    flex items-center justify-center
                    ${isActive ? 'w-5 h-5 rounded-md' : 'w-5 h-5'}
                  `}
                  style={{
                    backgroundColor: 'transparent'
                  }}
                  >
                    <Icon 
                      className="h-5 w-5 flex-shrink-0" 
                      style={{
                        color: isActive 
                          ? (theme === 'dark' ? '#dbeafe' : '#000000')
                          : (theme === 'dark' ? '#d1d5db' : '#000000')
                      }}
                    />
                  </div>
                  <span className={`ml-3 transition-all duration-200 ease-out ${isCollapsed ? 'opacity-0 scale-95 w-0 overflow-hidden' : 'opacity-100 scale-100'}`}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User Section */}
        <div 
          className="p-4 border-t transition-colors duration-300"
          style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
        >
          <div className={`transition-all duration-200 ease-out ${isCollapsed ? 'opacity-0 scale-95 h-0 overflow-hidden' : 'opacity-100 scale-100'}`}>
            {!isCollapsed && user && (
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-sm font-medium truncate transition-colors duration-300"
                    style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                  >
                    {user.user_metadata?.name || user.email}
                  </p>
                  <p 
                    className="text-xs truncate transition-colors duration-300"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  >
                    {user.email}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className={`
              flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-out w-full
              ${isCollapsed ? 'justify-center' : ''}
            `}
            style={{
              color: theme === 'dark' ? '#ef4444' : '#dc2626'
            }}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className={`ml-3 transition-all duration-200 ease-out ${isCollapsed ? 'opacity-0 scale-95 w-0 overflow-hidden' : 'opacity-100 scale-100'}`}>
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
      >
        <Menu className="h-6 w-6" />
      </button>
    </>
  )
}

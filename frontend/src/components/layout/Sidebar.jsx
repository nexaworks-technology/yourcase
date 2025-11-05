import { useState } from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import {
  Home,
  Sparkles,
  FileText,
  Briefcase,
  Workflow,
  LayoutDashboard,
  BarChart3,
  Settings,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { Tooltip } from '../ui/Tooltip'

const navItems = [
  { label: 'Dashboard', to: '/', icon: Home },
  { label: 'AI Assistant', to: '/assistant', icon: Sparkles },
  { label: 'Documents', to: '/documents', icon: FileText },
  { label: 'Matters', to: '/matters', icon: Briefcase },
  { label: 'Workflows', to: '/workflows', icon: Workflow },
  { label: 'Templates', to: '/templates', icon: LayoutDashboard },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Settings', to: '/settings', icon: Settings },
]

export function Sidebar({ isOpen = true, onToggle }) {
  const [collapsed, setCollapsed] = useState(!isOpen)

  const handleToggle = () => {
    setCollapsed((prev) => !prev)
    onToggle?.(!collapsed)
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-[80] hidden flex-col border-r border-slate-200/70 bg-gradient-to-br from-white via-white to-slate-50 shadow-sm transition-all duration-300 lg:flex',
        collapsed ? 'w-20' : 'w-72',
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold text-slate-800">YourCase HQ</p>
            <p className="text-xs text-slate-500">Enterprise workspace</p>
          </div>
        )}
        <button
          type="button"
          onClick={handleToggle}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-slate-700"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft className={cn('h-4 w-4 transition', collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-2">
        {navItems.map((item) => (
          <Tooltip key={item.to} content={item.label} position="right">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-500 transition hover:bg-blue-50 hover:text-blue-600',
                  isActive && 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm',
                )
              }
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          </Tooltip>
        ))}
      </nav>

      <div className={cn('border-t border-slate-100/80 px-4 py-5', collapsed && 'px-1.5')}>
        <div className="flex items-center gap-3 rounded-2xl bg-slate-100/60 px-3 py-2">
          <img src="https://i.pravatar.cc/60" alt="User avatar" className="h-10 w-10 rounded-full" />
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold text-slate-800">Alex Garner</p>
              <p className="text-xs text-slate-500">Enterprise plan</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func,
  isMobile: PropTypes.bool,
  onClose: PropTypes.func,
}

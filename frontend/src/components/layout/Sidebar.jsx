import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Sparkles,
  FileText,
  Briefcase,
  Workflow,
  LayoutDashboard,
  BarChart3,
  Settings,
  User,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', to: '/', icon: Home },
  { label: 'AI Assistant', to: '/ai-assistant', icon: Sparkles },
  { label: 'Documents', to: '/documents', icon: FileText },
  { label: 'Matters', to: '/matters', icon: Briefcase },
  { label: 'Workflows', to: '/workflows', icon: Workflow },
  { label: 'Templates', to: '/templates', icon: LayoutDashboard },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Settings', to: '/settings', icon: Settings },
]

export function Sidebar({ isOpen = true, onToggle, onOpenSettings }) {
  const [expanded, setExpanded] = useState(isOpen)
  const [hovered, setHovered] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setExpanded(isOpen)
  }, [isOpen])

  const handleCollapse = () => {
    setExpanded(false)
    onToggle?.(false)
  }

  const handleExpand = () => {
    setExpanded(true)
    onToggle?.(true)
  }

  const isActive = (path) => location.pathname === path
  const showMenuIcon = !expanded && hovered
  const collapsed = !expanded

  return (
    <aside
      className={`${expanded ? 'w-60' : 'w-20'} fixed inset-y-0 left-0 z-[120] hidden flex-col border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 shadow-sm transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 lg:flex`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="px-4 pb-8 border-b border-gray-100 dark:border-gray-800 mb-5 dark:border-gray-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            {expanded ? (
              <>
                <div className="w-11 h-11 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold dark:bg-gray-100 dark:text-gray-900 dark:text-gray-100">
                  Logo
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 dark:text-gray-100">YourCase HQ</span>
              </>
            ) : (
              <button
                type="button"
                onClick={handleExpand}
                className="flex w-full items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-2 text-gray-600 dark:text-gray-300 transition hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                aria-label="Expand sidebar"
              >
                {showMenuIcon ? (
                  <Menu size={20} />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold dark:bg-gray-100 dark:text-gray-900 dark:text-gray-100">
                    Logo
                  </div>
                )}
              </button>
            )}
          </div>
          {expanded && (
            <button
              className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:text-gray-300 transition-colors p-1 flex items-center justify-center dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:hover:text-gray-200"
              onClick={handleCollapse}
              aria-label="Collapse sidebar"
              type="button"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <nav className="flex flex-col gap-2 px-3 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.to)

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-200 ${
                active
                  ? expanded
                    ? 'text-blue-600 bg-blue-50 border border-blue-200 shadow-sm dark:text-blue-400 dark:bg-blue-400/10 dark:border-blue-500/20'
                    : 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-400/10'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 dark:text-gray-500 dark:hover:text-gray-100 dark:hover:bg-gray-800'
              } ${collapsed ? 'justify-center' : 'justify-start'}`}
              title={collapsed ? item.label : ''}
            >
              <span className="flex h-6 w-6 items-center justify-center text-base text-inherit">
                <Icon size={20} className="shrink-0" />
              </span>
              <span
                className={`ml-3 truncate text-gray-900 dark:text-gray-100 transition-all duration-200 group-hover:text-inherit dark:text-gray-100 ${
                  collapsed ? 'w-0 opacity-0 scale-95' : 'w-auto opacity-100'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className={`flex flex-col gap-2 px-3 pt-5 border-t border-gray-100 dark:border-gray-800 dark:border-gray-800 ${expanded ? '' : 'items-center'}`}>
        <button
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm font-medium dark:text-gray-400 dark:text-gray-500 dark:hover:text-gray-100 dark:hover:bg-gray-800 ${
            expanded ? 'justify-start w-full' : 'justify-center'
          }`}
          title="Settings"
          aria-label="Settings"
          type="button"
          onClick={onOpenSettings}
        >
          <Settings size={24} className="shrink-0" />
          {expanded && <span>Settings</span>}
        </button>
        <button
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm font-medium dark:text-gray-400 dark:text-gray-500 dark:hover:text-gray-100 dark:hover:bg-gray-800 ${
            expanded ? 'justify-start w-full' : 'justify-center'
          }`}
          title="Profile"
          aria-label="Profile"
          type="button"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white shrink-0">
            <User size={14} />
          </div>
          {expanded && <span>Profile</span>}
        </button>
      </div>
    </aside>
  )
}

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func,
  onOpenSettings: PropTypes.func,
  isMobile: PropTypes.bool,
  onClose: PropTypes.func,
}

Sidebar.defaultProps = {
  isOpen: true,
  onToggle: undefined,
  onOpenSettings: undefined,
  isMobile: undefined,
  onClose: undefined,
}

export default Sidebar

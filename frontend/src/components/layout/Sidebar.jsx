import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Link, useLocation } from 'react-router-dom'
import { User, Menu, X, Bell, UserRound, Mail, Settings } from 'lucide-react'
import { navItems } from './navItems'

// navItems now imported from shared file to sync with Navbar

export function Sidebar({ isOpen = true, onToggle, onOpenSettings }) {
  const [expanded, setExpanded] = useState(isOpen)
  const [hovered, setHovered] = useState(false)
  const hoverTimer = useRef(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()
  const profileRef = useRef(null)
  const dropdownRef = useRef(null)
  // missing refs/state used below
  const expandBtnRef = useRef(null)
  const collapseBtnRef = useRef(null)
  const [expandTip, setExpandTip] = useState(false)
  const [collapseTip, setCollapseTip] = useState(false)

  useEffect(() => {
    setExpanded(isOpen)
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!profileOpen) return
      if (profileRef.current?.contains(event.target) || dropdownRef.current?.contains(event.target)) {
        return
      }
      setProfileOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [profileOpen])

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
      className={`${expanded ? 'w-60' : 'w-20'} fixed inset-y-0 left-0 z-[120] hidden flex-col bg-gray-800 border-r border-gray-700 text-gray-100 shadow-sm transition-[width] duration-300 ease-in-out motion-reduce:transition-none lg:flex py-5`}
      onMouseEnter={() => {
        if (hoverTimer.current) window.clearTimeout(hoverTimer.current)
        hoverTimer.current = window.setTimeout(() => setHovered(true), 120)
      }}
      onMouseLeave={() => {
        if (hoverTimer.current) window.clearTimeout(hoverTimer.current)
        hoverTimer.current = window.setTimeout(() => setHovered(false), 80)
      }}
      style={{ willChange: 'width' }}
      aria-label="Primary"
    >
      <div className="px-4 pb-8 border-b border-gray-700 mb-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            {expanded ? (
              <>
                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 font-semibold text-xs shrink-0">Logo</div>
                <span className="text-sm font-medium text-gray-100">YourCase HQ</span>
              </>
            ) : (
              <>
              <button
                ref={expandBtnRef}
                type="button"
                onClick={handleExpand}
                className="text-gray-400 hover:text-gray-100 transition-colors p-1 flex items-center justify-center"
                aria-label="Expand sidebar"
                aria-describedby={expandTip ? 'yc-expand-tip' : undefined}
                onMouseEnter={() => setExpandTip(true)}
                onMouseLeave={() => setExpandTip(false)}
                onFocus={() => setExpandTip(true)}
                onBlur={() => setExpandTip(false)}
                onMouseDown={(e) => {
                  const t = e.currentTarget
                  const rect = t.getBoundingClientRect()
                  t.style.setProperty('--ink-x', `${e.clientX - rect.left}px`)
                  t.style.setProperty('--ink-y', `${e.clientY - rect.top}px`)
                }}
              >
                <div className="relative h-9 w-9">
                  {/* Logo layer */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center rounded-full bg-gray-900 text-white text-xs font-semibold dark:bg-gray-100 dark:text-gray-900 transition-opacity duration-150 ease-out motion-reduce:transition-none ${
                      showMenuIcon ? 'opacity-0' : 'opacity-100'
                    }`}
                    aria-hidden={showMenuIcon}
                  >
                    Logo
                  </div>
                  {/* Menu layer */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center rounded-full transition-opacity duration-150 ease-out motion-reduce:transition-none ${
                      showMenuIcon ? 'opacity-100' : 'opacity-0'
                    }`}
                    aria-hidden={!showMenuIcon}
                  >
                    <Menu size={20} />
                  </div>
                </div>
              </button>
              {expandTip && (
                <span id="yc-expand-tip" role="tooltip" className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-100 shadow-sm">Expand (Right Arrow)</span>
              )}
              </>
            )}
          </div>
          {expanded && (
            <div className="relative">
              <button
                ref={collapseBtnRef}
                className="text-gray-400 hover:text-gray-100 transition-colors p-1 flex items-center justify-center"
                onClick={handleCollapse}
                aria-label="Collapse sidebar"
                aria-pressed={!collapsed}
                type="button"
                aria-describedby={collapseTip ? 'yc-collapse-tip' : undefined}
                onMouseEnter={() => setCollapseTip(true)}
                onMouseLeave={() => setCollapseTip(false)}
                onFocus={() => setCollapseTip(true)}
                onBlur={() => setCollapseTip(false)}
              >
                <X size={20} />
              </button>
              {collapseTip && (
                <span id="yc-collapse-tip" role="tooltip" className="pointer-events-none absolute right-0 top-full mt-2 whitespace-nowrap rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-100 shadow-sm">Collapse (Left Arrow)</span>
              )}
            </div>
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
              className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 ${
                active
                  ? 'text-blue-400 bg-blue-400/10 border-l-3 border-blue-400 pl-[13px]'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-700'
              } ${expanded ? 'justify-start' : 'justify-center'}`}
              title={collapsed ? item.label : ''}
              aria-current={active ? 'page' : undefined}
              onMouseDown={() => {}}
            >
              <Icon size={24} className="shrink-0" />
              {expanded && <span>{item.label}</span>}
              {collapsed && <span className="sr-only">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className={`relative flex flex-col gap-2 px-3 pt-5 border-t border-gray-700 ${expanded ? '' : 'items-center'}`}>
        <button
          ref={profileRef}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-gray-700 transition-all text-sm font-medium ${
            expanded ? 'justify-start w-full' : 'justify-center'
          } ${profileOpen ? 'bg-gray-700' : ''}`}
          title="Profile menu"
          aria-haspopup="menu"
          aria-expanded={profileOpen}
          type="button"
          onClick={() => setProfileOpen((prev) => !prev)}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white shrink-0">
            <User size={16} />
          </div>
          {expanded && (
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium text-gray-100">Name</span>
              <span className="text-xs text-gray-400">moni.roy@example.com</span>
            </div>
          )}
        </button>

        {profileOpen && (
          <div
            ref={dropdownRef}
            className={`absolute ${expanded ? 'left-3 right-3' : 'left-1/2 -translate-x-1/2 w-56'} bottom-[-0.75rem] translate-y-full rounded-2xl border border-gray-700 bg-gray-800 shadow-xl`}
          >
            <div className="px-4 py-3 border-b border-gray-700">
              <p className="text-sm font-semibold text-gray-100">Moni Roy</p>
              <p className="mt-1 text-xs text-gray-400">moni.roy@example.com</p>
            </div>
            <ul className="py-1 text-sm text-gray-300">
              <li>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-2 hover:bg-gray-700"
                  onClick={() => {
                    setProfileOpen(false)
                    onOpenSettings?.()
                  }}
                >
                  <Settings size={16} />
                  Settings
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-2 hover:bg-gray-700"
                  onClick={() => setProfileOpen(false)}
                >
                  <Bell size={16} />
                  Notifications
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="flex w/full items-center gap-3 px-4 py-2 hover:bg-gray-700"
                  onClick={() => setProfileOpen(false)}
                >
                  <UserRound size={16} />
                  View profile
                </button>
              </li>
              <li className="border-t border-gray-700">
                <span className="flex items-center gap-3 px-4 py-2 text-xs text-gray-400"><Mail size={14} /> moni.roy@example.com</span>
              </li>
            </ul>
          </div>
        )}
      </div>
      {!expanded && (
        <button
          className="text-gray-400 hover:text-gray-100 transition-colors p-3 flex items-center justify-center w-full"
          onClick={() => setExpanded(true)}
          aria-label="Expand sidebar"
        >
          <Menu size={20} />
        </button>
      )}
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

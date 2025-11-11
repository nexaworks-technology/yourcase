import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Link, NavLink } from 'react-router-dom'
import { Bell, Menu, User, Settings, CreditCard, LogOut } from 'lucide-react'
import { Dropdown } from '../ui/Dropdown'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/cn'

const navItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'AI Assistant', to: '/assistant' },
  { label: 'Documents', to: '/documents' },
  { label: 'Matters', to: '/matters' },
  { label: 'Workflows', to: '/workflows' },
]

export function Navbar({ onToggleSidebar }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const userMenuItems = [
    { label: 'Profile', value: 'profile', icon: User },
    { label: 'Settings', value: 'settings', icon: Settings },
    { label: 'Billing', value: 'billing', icon: CreditCard },
    { divider: true },
    { label: 'Logout', value: 'logout', icon: LogOut },
  ]

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-[90] flex h-16 items-center border-b border-slate-200/60 bg-white/75 px-4 backdrop-blur transition-all duration-200 sm:px-6 lg:px-8',
        scrolled && 'shadow-md',
      )}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 lg:hidden"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1 shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" aria-hidden="true" />
            <span className="text-sm font-semibold text-slate-800">YourCase</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'text-sm font-semibold text-slate-500 transition hover:text-slate-800',
                  isActive && 'text-blue-600',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:text-slate-700"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[0.65rem] font-semibold text-white">
              4
            </span>
          </button>

          <Dropdown
            position="bottom-right"
            items={userMenuItems}
            trigger={({ ref, toggle, isOpen }) => (
              <button
                ref={ref}
                type="button"
                onClick={toggle}
                aria-expanded={isOpen}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 pe-3 shadow-sm transition hover:shadow-md"
              >
                <img
                  src="https://i.pravatar.cc/80"
                  alt="User avatar"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-slate-800">Alex Garner</p>
                  <Badge variant="primary" size="sm">General Counsel</Badge>
                </div>
              </button>
            )}
          />
        </div>
      </div>
    </header>
  )
}

Navbar.propTypes = {
  onToggleSidebar: PropTypes.func,
}

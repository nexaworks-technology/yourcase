import { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Bell, CheckCircle, Clock, FileText } from 'lucide-react'

export function Navbar({ sidebarOpen }) {
  const [scrolled, setScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef(null)
  const toggleRef = useRef(null)

  const notifications = useMemo(
    () => [
      {
        id: 'notif-1',
        title: 'Document summary ready',
        description: 'AI assistant completed summarising the 2024 contract draft.',
        time: '2m ago',
        icon: FileText,
      },
      {
        id: 'notif-2',
        title: 'Matter hearing reminder',
        description: 'High Court hearing in *R. Sharma vs Apex Tech* starts in 1 hour.',
        time: '1h ago',
        icon: Clock,
      },
      {
        id: 'notif-3',
        title: 'Workflow completed',
        description: 'Due diligence workflow "YC-2025" finished by Aarav Mehta.',
        time: 'Yesterday',
        icon: CheckCircle,
      },
    ],
    [],
  )

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickAway = (event) => {
      if (!isOpen) return
      const target = event.target
      if (panelRef.current?.contains(target) || toggleRef.current?.contains(target)) {
        return
      }
      setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickAway)
    return () => document.removeEventListener('mousedown', handleClickAway)
  }, [isOpen])

  const sidebarPaddingClass = sidebarOpen ? 'lg:pl-60' : 'lg:pl-20'

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[100] flex h-16 items-center border-b border-gray-200 dark:border-gray-700 dark:border-gray-800 bg-white dark:bg-slate-900/80 dark:bg-slate-900/80 dark:bg-gray-950/95 px-4 backdrop-blur transition-all duration-200 sm:px-6 lg:px-8 ${sidebarPaddingClass} ${
        scrolled ? 'shadow-lg shadow-black/10 dark:shadow-black/30' : ''
      }`}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="inline-flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:border-gray-800 bg-white dark:bg-slate-900 dark:bg-gray-900 px-3 py-1 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 dark:text-gray-100 flex items-center justify-center text-xs font-semibold">
              Logo
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100">YourCase</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            ref={toggleRef}
            className="relative rounded-lg border border-gray-200 dark:border-gray-700 dark:border-gray-800 bg-white dark:bg-slate-900 dark:bg-gray-900 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100 dark:text-gray-300 dark:hover:text-gray-100"
            aria-label="Notifications"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-blue-500 px-1 text-[0.65rem] font-semibold text-white">
              {notifications.length}
            </span>
          </button>

          {isOpen && (
            <div
              ref={panelRef}
              className="absolute right-4 top-16 z-[120] w-80 origin-top-right rounded-2xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5 transition dark:border-gray-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</p>
                <button
                  type="button"
                  className="text-xs font-medium text-blue-600 hover:underline"
                  onClick={() => setIsOpen(false)}
                >
                  Mark all read
                </button>
              </div>
              <ul className="max-h-80 overflow-y-auto px-2 py-2">
                {notifications.map(({ id, title, description, time, icon: Icon }) => (
                  <li
                    key={id}
                    className="group flex gap-3 rounded-xl px-3 py-3 text-sm text-gray-700 transition hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-slate-800"
                  >
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{title}</p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
                      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">{time}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-100 px-4 py-3 text-center text-xs text-blue-600 hover:text-blue-500 dark:border-gray-800">
                <button type="button" className="font-medium">
                  View all activity
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:border-gray-800 rounded-2xl px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white text-xs font-semibold">
              MR
            </div>
            <div className="hidden text-left sm:flex sm:flex-col">
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 dark:text-gray-100">Moni Roy</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

Navbar.propTypes = {
  sidebarOpen: PropTypes.bool,
}

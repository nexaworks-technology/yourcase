import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'

export function Navbar({ sidebarOpen }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
            className="relative rounded-lg border border-gray-200 dark:border-gray-700 dark:border-gray-800 bg-white dark:bg-slate-900 dark:bg-gray-900 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100 dark:text-gray-300 dark:hover:text-gray-100"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-blue-500 px-1 text-[0.65rem] font-semibold text-white">
              4
            </span>
          </button>

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

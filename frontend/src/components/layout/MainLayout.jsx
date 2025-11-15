import { useState } from 'react'
import PropTypes from 'prop-types'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { Container } from './Container'
import { SettingsDrawer } from '../settings/SettingsDrawer'

export function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const mainPaddingClass = sidebarOpen ? 'lg:pl-60' : 'lg:pl-20'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 dark:bg-gray-950 dark:text-gray-100 transition-colors">
      <Navbar sidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} onOpenSettings={() => setSettingsOpen(true)} />

      <main className={`pt-20 transition-all ${mainPaddingClass}`}>
        <Container maxWidth="2xl">
          <div className="py-8">
            {children ?? <Outlet />}
          </div>
        </Container>
      </main>

      <SettingsDrawer isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

MainLayout.propTypes = {
  children: PropTypes.node,
}

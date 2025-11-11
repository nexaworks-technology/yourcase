import { useState } from 'react'
import PropTypes from 'prop-types'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { Container } from './Container'

export function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <Sidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />

      <main className="pt-20 lg:pl-72">
        <Container maxWidth="2xl">
          <div className="py-8">
            {children ?? <Outlet />}
          </div>
        </Container>
      </main>
    </div>
  )
}

MainLayout.propTypes = {
  children: PropTypes.node,
}

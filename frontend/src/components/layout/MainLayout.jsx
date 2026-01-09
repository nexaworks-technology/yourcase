import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Outlet, useNavigate } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { Container } from './Container'
import { SettingsDrawer } from '../settings/SettingsDrawer'
import { useTheme } from '../../context/ThemeContext'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

export function MainLayout({ children }) {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [fade, setFade] = useState(false)
  const fadeRef = useRef(null)
  const { theme } = useTheme()
  const themeAnnouncedRef = useRef(false)
  const [e2eMapOpen, setE2eMapOpen] = useState(false)

  const mainPaddingClass = sidebarOpen ? 'lg:pl-60' : 'lg:pl-20'
  const [sidebarTransitioning, setSidebarTransitioning] = useState(false)
  useEffect(() => {
    // When sidebarOpen changes, reflect a brief transitioning state for subtle skeletons
    setSidebarTransitioning(true)
    const t = window.setTimeout(() => setSidebarTransitioning(false), 220)
    return () => window.clearTimeout(t)
  }, [sidebarOpen])

  // Cross-fade overlay on theme change
  useEffect(() => {
    setFade(true)
    window.clearTimeout(fadeRef.current)
    fadeRef.current = window.setTimeout(() => setFade(false), 200)
  }, [theme])

  // Announce theme changes for screen readers
  useEffect(() => {
    // Skip the very first render to avoid redundant announcement
    if (!themeAnnouncedRef.current) {
      themeAnnouncedRef.current = true
      return
    }
    const live = document.getElementById('yc-theme-live')
    if (live) live.textContent = `Theme changed to ${theme}`
  }, [theme])

  // Keyboard shortcuts for sidebar toggle
  useEffect(() => {
    const onKey = (e) => {
      // Ignore if user is typing in inputs/textareas or using modifiers
      const tag = document.activeElement?.tagName?.toLowerCase()
      const isTyping = tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable
      if (isTyping || e.altKey || e.ctrlKey || e.metaKey) return

      if (e.key === 'ArrowLeft' && sidebarOpen) {
        setSidebarOpen(false)
        const live = document.getElementById('yc-sidebar-live')
        live && (live.textContent = 'Sidebar collapsed')
      } else if (e.key === 'ArrowRight' && !sidebarOpen) {
        setSidebarOpen(true)
        const live = document.getElementById('yc-sidebar-live')
        live && (live.textContent = 'Sidebar expanded')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sidebarOpen])

  // E2E: listen for CSV mapping open event at layout level and navigate to Settings
  useEffect(() => {
    const onE2EOpenCsvMap = () => {
      try { document.body.dataset.mapCsvOpen = '1' } catch (_) {}
      setE2eMapOpen(true)
    }
    try { window.addEventListener('yc:e2e:openCsvMap', onE2EOpenCsvMap) } catch (_) {}
    return () => { try { window.removeEventListener('yc:e2e:openCsvMap', onE2EOpenCsvMap) } catch (_) {} }
  }, [navigate])

  // E2E: auto-open if URL contains e2e=csv-map
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.get('e2e') === 'csv-map') {
        try { document.body.dataset.mapCsvOpen = '1' } catch (_) {}
        setE2eMapOpen(true)
      }
    } catch (_) {}
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 dark:bg-gray-950 dark:text-gray-100 transition-colors">
      <div className="yc-theme-anim" data-active={fade ? 'true' : 'false'}>
        <Navbar sidebarOpen={sidebarOpen} />
      </div>
      <div className="yc-theme-anim" data-active={fade ? 'true' : 'false'}>
        <Sidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} onOpenSettings={() => setSettingsOpen(true)} />
      </div>

      <main className={`pt-20 transition-all ${mainPaddingClass}`}>
        <Container maxWidth="2xl">
          <div className={`py-8 ${sidebarTransitioning ? 'yc-theme-anim' : ''}`} data-active={sidebarTransitioning ? 'true' : 'false'}>
            {sidebarTransitioning && (
              <div className="mb-6 hidden lg:block" aria-hidden="true">
                <div className="animate-pulse h-6 w-40 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            )}
            {children ?? <Outlet />}
          </div>
        </Container>
      </main>

      <SettingsDrawer isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <div className="yc-theme-fade" data-show={fade ? 'true' : 'false'} aria-hidden="true" />
      {/* aria-live region for announcing sidebar state changes from keyboard */}
      <div id="yc-sidebar-live" className="sr-only" role="status" aria-live="polite" />
      {/* aria-live region for announcing theme changes */}
      <div id="yc-theme-live" className="sr-only" role="status" aria-live="polite" />

      {e2eMapOpen && (
        <Modal
          isOpen={e2eMapOpen}
          onClose={() => { setE2eMapOpen(false); try { delete document.body.dataset.mapCsvOpen } catch (_) {} }}
          title="Map CSV columns"
          size="md"
          testId="map-csv-modal"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => { setE2eMapOpen(false); try { delete document.body.dataset.mapCsvOpen } catch (_) {} }}>Cancel</Button>
              <Button variant="primary" onClick={() => { setE2eMapOpen(false); try { delete document.body.dataset.mapCsvOpen } catch (_) {} }}>Continue</Button>
            </div>
          }
        >
          <div className="text-sm">
            <p className="mb-2">E2E preview only. This minimal modal is shown for screenshot capture.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Select message column</li>
              <li>Optional: time column and format</li>
              <li>Optional: pinned flag column</li>
            </ul>
          </div>
        </Modal>
      )}
    </div>
  )
}

MainLayout.propTypes = {
  children: PropTypes.node,
}

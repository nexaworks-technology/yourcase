import { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Link, useLocation } from 'react-router-dom'
import { Bell, CheckCircle, Clock, FileText, Sun, Moon, Laptop, ChevronDown, Check, Copy, Download, Upload, Pin, PinOff, Trash2, Info } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'
import { useTheme } from '../../context/ThemeContext'
import { navItems } from './navItems'
import { toast } from 'sonner'
import Button from '../ui/Button'
import { useLive } from '../ui/LiveAnnouncer'

export function Navbar({ sidebarOpen }) {
  const [scrolled, setScrolled] = useState(false)
  const [themeTransitioning, setThemeTransitioning] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef(null)
  const toggleRef = useRef(null)
  const { theme, setTheme } = useTheme()
  const [showTip, setShowTip] = useState(false)
  const tipRef = useRef(null)
  const [tipAlign, setTipAlign] = useState('center')
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const themeMenuRef = useRef(null)
  const themeBtnRef = useRef(null)
  const { accentColor, setAccentColor } = useTheme()
  const prevFocusRef = useRef(null)
  const roveRef = useRef({ mounted: false })
  const [helpOpen, setHelpOpen] = useState(false)
  const helpRef = useRef(null)
  const helpBtnRef = useRef(null)
  const helpPrevFocusRef = useRef(null)
  const { preferences, updatePreferences } = useSettingsStore()
  const location = useLocation()
  const active = navItems.find((i) => i.to === location.pathname)
  const { announce } = useLive()
  const [recentToasts, setRecentToasts] = useState([])
  const [recentLoading, setRecentLoading] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [mergeImport, setMergeImport] = useState(true)
  const [pendingImport, setPendingImport] = useState(null)
  const fileRef = useRef(null)
  const fileCsvRef = useRef(null)
  const [csvMapOpen, setCsvMapOpen] = useState(false)
  const [csvHeaders, setCsvHeaders] = useState([])
  const [csvRows, setCsvRows] = useState([])
  const [csvTimeIdx, setCsvTimeIdx] = useState(0)
  const [csvMsgIdx, setCsvMsgIdx] = useState(1)
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)
  const [pinFirst, setPinFirst] = useState(true)
  const [pinnedOnlyDefault, setPinnedOnlyDefault] = useState(false)
  const [pinFirstDefault, setPinFirstDefault] = useState(true)
  const [qvQuery, setQvQuery] = useState('')
  const qvInputRef = useRef(null)
  const recentListRef = useRef(null)
  const [logPreviewOpen, setLogPreviewOpen] = useState(false)
  const [logPreview, setLogPreview] = useState([])
  const [lastBadgeDismissed, setLastBadgeDismissed] = useState(false)
  const [statsTip, setStatsTip] = useState(false)
  const [exportChip, setExportChip] = useState(() => {
    try {
      const dismissed = sessionStorage.getItem('yc_toasts_badge_dismissed') === '1'
      if (dismissed) return null
      return JSON.parse(sessionStorage.getItem('yc_toasts_last_summary') || 'null')
    } catch {
      return null
    }
  })

  // React to Settings → "Clear badge" to hide export chip immediately
  useEffect(() => {
    const onClear = () => setExportChip(null)
    window.addEventListener('yc_toasts_badge_cleared', onClear)
    return () => window.removeEventListener('yc_toasts_badge_cleared', onClear)
  }, [])

  // When Settings resets dismissal, re-read last summary and show chip if available
  useEffect(() => {
    const onReset = () => {
      try {
        const raw = sessionStorage.getItem('yc_toasts_last_summary')
        const s = raw ? JSON.parse(raw) : null
        setExportChip(s)
      } catch (_) {
        setExportChip(null)
      }
    }
    window.addEventListener('yc_toasts_badge_reset', onReset)
    return () => window.removeEventListener('yc_toasts_badge_reset', onReset)
  }, [])

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

  // Brief skeleton on theme changes to smooth tiny layout shifts in Navbar
  const { theme: currentTheme } = useTheme()
  useEffect(() => {
    setThemeTransitioning(true)
    const t = window.setTimeout(() => setThemeTransitioning(false), 200)
    return () => window.clearTimeout(t)
  }, [currentTheme])

  // Load recent toasts from session when help opens
  useEffect(() => {
    if (!helpOpen) return
    setRecentLoading(true)
    try {
      const raw = sessionStorage.getItem('yc_toasts_recent')
      const arr = raw ? JSON.parse(raw) : []
      // Normalize and newest first
      const normalized = Array.isArray(arr)
        ? [...arr].reverse().map((r) => ({ t: Number(r.t) || Date.now(), m: String(r.m || ''), p: !!r.p }))
        : []
      setRecentToasts(normalized)
    } catch (_) {
      setRecentToasts([])
    } finally {
      setRecentLoading(false)
    }
    // Restore quick-view preference: pinned-only
    try {
      const pref = sessionStorage.getItem('yc_toasts_pinned_only')
      if (pref == null) {
        const d = localStorage.getItem('yc_toasts_pinned_only_default')
        setShowPinnedOnly(d === '1')
      } else {
        setShowPinnedOnly(pref === '1')
      }
      const d = localStorage.getItem('yc_toasts_pinned_only_default')
      setPinnedOnlyDefault(d === '1')

      const pf = sessionStorage.getItem('yc_toasts_pin_first')
      if (pf == null) {
        const pdf = localStorage.getItem('yc_toasts_pin_first_default')
        setPinFirst(pdf == null ? true : pdf === '1')
      } else {
        setPinFirst(pf === '1')
      }
      const pdf = localStorage.getItem('yc_toasts_pin_first_default')
      setPinFirstDefault(pdf == null ? true : pdf === '1')
      const q = sessionStorage.getItem('yc_toasts_qv_query')
      setQvQuery(q ? String(q) : '')
    } catch (_) {}
  }, [helpOpen])

  // Restore badge dismissed state for this session
  useEffect(() => {
    try {
      setLastBadgeDismissed(sessionStorage.getItem('yc_toasts_badge_dismissed') === '1')
    } catch (_) {}
    const onCleared = () => setLastBadgeDismissed(true)
    window.addEventListener('yc_toasts_badge_cleared', onCleared)
    return () => window.removeEventListener('yc_toasts_badge_cleared', onCleared)
  }, [])

  const formatTime = (t) => {
    try {
      const d = new Date(t)
      return isNaN(d.getTime()) ? '' : d.toLocaleString()
    } catch {
      return ''
    }
  }

  const copyJSON = async () => {
    const data = recentToasts.map(({ t, m }) => ({ time: t, message: m }))
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      try { sessionStorage.setItem('yc_toasts_last_summary', JSON.stringify({ type: 'export', format: 'json', count: data.length, ts: Date.now() })) } catch (_) {}
      announce(`Copied ${data.length} recent toasts as JSON`, { toast: { variant: 'success' } })
    } catch (e) {
      announce('Failed to copy JSON', { toast: { variant: 'error' } })
    }
  }

  const toCSV = (rows) => {
    const esc = (s) => {
      const v = String(s ?? '')
      if (/[",\n]/.test(v)) return '"' + v.replace(/"/g, '""') + '"'
      return v
    }
    const lines = ['time,message']
    rows.forEach(({ t, m }) => lines.push(`${esc(formatTime(t))},${esc(m)}`))
    return lines.join('\n')
  }

  const downloadCSV = () => {
    const data = toCSV(recentToasts)
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'recent-toasts.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    try { sessionStorage.setItem('yc_toasts_last_summary', JSON.stringify({ type: 'export', format: 'csv', count: recentToasts.length, ts: Date.now() })) } catch (_) {}
    announce('Downloaded recent toasts CSV', { toast: { variant: 'success' } })
  }

  // Minimal ZIP (store only) builder for JSON+CSV without deps
  const downloadZIP = () => {
    const jsonStr = JSON.stringify(
      recentToasts.map(({ t, m }) => ({ time: t, message: m })),
      null,
      2,
    )
    const csvStr = toCSV(recentToasts)

    const files = [
      { name: 'recent-toasts.json', data: new TextEncoder().encode(jsonStr) },
      { name: 'recent-toasts.csv', data: new TextEncoder().encode(csvStr) },
    ]

    const makeCrc32Table = () => {
      const table = new Uint32Array(256)
      for (let i = 0; i < 256; i++) {
        let c = i
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
        table[i] = c >>> 0
      }
      return table
    }
    const CRC_TABLE = makeCrc32Table()
    const crc32 = (bytes) => {
      let c = 0xFFFFFFFF
      for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8)
      return (c ^ 0xFFFFFFFF) >>> 0
    }
    const LE16 = (n) => new Uint8Array([n & 0xFF, (n >>> 8) & 0xFF])
    const LE32 = (n) => new Uint8Array([n & 0xFF, (n >>> 8) & 0xFF, (n >>> 16) & 0xFF, (n >>> 24) & 0xFF])
    const concatU8 = (parts) => {
      const size = parts.reduce((n, p) => n + p.length, 0)
      const out = new Uint8Array(size)
      let pos = 0
      for (const p of parts) { out.set(p, pos); pos += p.length }
      return out
    }

    const chunks = []
    const central = []
    let offset = 0
    const now = new Date()
    const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2)) & 0xFFFF
    const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF

    for (const f of files) {
      const nameBytes = new TextEncoder().encode(f.name)
      const crc = crc32(f.data)
      const size = f.data.length >>> 0
      const localHeader = [
        LE32(0x04034b50), LE16(20), LE16(0), LE16(0), LE16(dosTime), LE16(dosDate),
        LE32(crc), LE32(size), LE32(size), LE16(nameBytes.length), LE16(0)
      ]
      const localChunk = concatU8([...localHeader, nameBytes, f.data])
      chunks.push(localChunk)

      const centralHeader = [
        LE32(0x02014b50), LE16(20), LE16(20), LE16(0), LE16(0), LE16(dosTime), LE16(dosDate),
        LE32(crc), LE32(size), LE32(size), LE16(nameBytes.length), LE16(0), LE16(0), LE16(0), LE16(0), LE32(0), LE32(offset), nameBytes
      ]
      const centralChunk = concatU8(centralHeader)
      central.push(centralChunk)
      offset += localChunk.length
    }

    const centralDir = concatU8(central)
    const end = concatU8([
      LE32(0x06054b50), LE16(0), LE16(0), LE16(files.length), LE16(files.length), LE32(centralDir.length), LE32(offset), LE16(0)
    ])
    const zipBytes = concatU8([...chunks, centralDir, end])

    const blob = new Blob([zipBytes], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'recent-toasts.zip'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    try { sessionStorage.setItem('yc_toasts_last_summary', JSON.stringify({ type: 'export', format: 'zip', count: recentToasts.length, ts: Date.now() })) } catch (_) {}
    announce('Downloaded recent toasts ZIP', { toast: { variant: 'success' } })
  }

  const showManageToastAndGo = () => {
    let txt = 'No recent import/export activity'
    try {
      const raw = sessionStorage.getItem('yc_toasts_last_summary')
      if (raw) {
        const s = JSON.parse(raw)
        const when = formatTime(Number(s.ts) || Date.now())
        if (s.type === 'export') {
          txt = `Last export (${s.format}) of ${s.count} at ${when}`
        } else if (s.type === 'import') {
          txt = `Last import (${s.format}, ${s.mode}) ${s.imported} → kept ${s.kept} at ${when}`
        }
      }
    } catch (_) {}
    announce(txt, { toast: { variant: 'info' } })
    try {
      if (location.pathname === '/settings') {
        const el = document.getElementById('recent-toasts')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        else window.location.hash = '#recent-toasts'
      } else {
        window.location.href = '/settings#recent-toasts'
      }
    } catch (_) {
      window.location.href = '/settings#recent-toasts'
    }
  }

  const persistRecent = (rows) => {
    try {
      const norm = rows.map((r) => ({ t: Number(r.t) || Date.now(), m: String(r.m || ''), p: !!r.p }))
      sessionStorage.setItem('yc_toasts_recent', JSON.stringify(norm))
    } catch (_) {}
    setRecentToasts(rows.slice().reverse().reverse())
  }

  const importJSON = () => {
    if (!fileRef.current) return
    fileRef.current.value = ''
    fileRef.current.click()
  }

  const onFileChange = (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onerror = () => {
      announce('Failed to read file', { toast: { variant: 'error' } })
    }
    reader.onload = () => {
      try {
        const text = String(reader.result || '')
        const json = JSON.parse(text)
        if (!Array.isArray(json)) throw new Error('Expected an array')
        const items = json
          .map((r) => ({
            t: Number(r.time ?? r.t ?? Date.now()),
            m: String(r.message ?? r.m ?? ''),
          }))
          .filter((r) => r.m.trim().length > 0 && !Number.isNaN(r.t))
        if (items.length === 0) {
          announce('No valid rows found in JSON', { toast: { variant: 'error' } })
          return
        }
        setPendingImport(items)
        setImportOpen(true)
      } catch (err) {
        announce('Invalid JSON file', { toast: { variant: 'error' } })
      }
    }
    reader.readAsText(f)
  }

  const importCSV = () => {
    if (!fileCsvRef.current) return
    fileCsvRef.current.value = ''
    fileCsvRef.current.click()
  }

  const parseCSV = (text) => {
    const rows = []
    let i = 0, field = '', inQuotes = false, row = []
    const pushField = () => { row.push(field); field = '' }
    const pushRow = () => { rows.push(row); row = [] }
    while (i < text.length) {
      const ch = text[i]
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i++ } else { inQuotes = false }
        } else { field += ch }
      } else {
        if (ch === '"') inQuotes = true
        else if (ch === ',') pushField()
        else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; pushField(); pushRow() }
        else field += ch
      }
      i++
    }
    if (field.length || row.length) { pushField(); pushRow() }
    const nonEmpty = rows.filter(r => r.some(c => String(c).trim().length > 0))
    const headers = nonEmpty.length ? nonEmpty[0].map((h, idx) => (String(h).trim() || `col_${idx + 1}`)) : []
    const data = nonEmpty.slice(1)
    return { headers, data }
  }

  const onCsvFileChange = (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onerror = () => announce('Failed to read CSV', { toast: { variant: 'error' } })
    reader.onload = () => {
      try {
        const text = String(reader.result || '')
        const { headers, data } = parseCSV(text)
        if (!headers.length || !data.length) {
          announce('No rows found in CSV', { toast: { variant: 'error' } })
          return
        }
        setCsvHeaders(headers)
        setCsvRows(data)
        // Heuristics: try find message/time columns
        const lower = headers.map(h => h.toLowerCase())
        let msgIdx = lower.findIndex(h => h.includes('message') || h.includes('text') || h.includes('msg'))
        if (msgIdx < 0) msgIdx = Math.min(1, headers.length - 1)
        let timeIdx = lower.findIndex(h => h.includes('time') || h.includes('date'))
        if (timeIdx < 0) timeIdx = 0
        setCsvMsgIdx(msgIdx)
        setCsvTimeIdx(timeIdx)
        setCsvMapOpen(true)
      } catch (_) {
        announce('Invalid CSV content', { toast: { variant: 'error' } })
      }
    }
    reader.readAsText(f)
  }

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

  // Global shortcut: Shift+/ ("?") opens Keyboard Shortcuts panel
  useEffect(() => {
    const onKey = (e) => {
      if ((e.shiftKey && e.key === '/') || e.key === '?') {
        e.preventDefault()
        setHelpOpen(true)
      } else if (e.key === 'Escape') {
        setHelpOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Click outside to close help panel
  useEffect(() => {
    if (!helpOpen) return
    const onDoc = (e) => {
      if (helpRef.current?.contains(e.target) || helpBtnRef.current?.contains(e.target)) return
      setHelpOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [helpOpen])

  // Focus trap + initial/restore focus for help panel
  useEffect(() => {
    if (!helpOpen) return
    helpPrevFocusRef.current = document.activeElement
    // Focus first focusable in the dialog
    setTimeout(() => {
      const root = helpRef.current
      if (!root) return
      const focusables = root.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const first = Array.from(focusables).find((el) => !el.hasAttribute('disabled'))
      first?.focus()
    }, 0)

    const onKey = (e) => {
      if (!helpOpen) return
      if (e.key === 'Escape') {
        e.stopPropagation()
        setHelpOpen(false)
        return
      }
      if (e.key === 'Tab') {
        const root = helpRef.current
        if (!root) return
        const list = Array.from(
          root.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        ).filter((el) => !el.hasAttribute('disabled'))
        if (list.length === 0) return
        const current = document.activeElement
        let idx = list.indexOf(current)
        if (e.shiftKey) idx = idx <= 0 ? list.length - 1 : idx - 1
        else idx = idx === list.length - 1 ? 0 : idx + 1
        e.preventDefault()
        list[idx].focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      // Restore focus
      const prev = helpPrevFocusRef.current
      prev && typeof prev.focus === 'function' && prev.focus()
    }
  }, [helpOpen])

  useEffect(() => {
    const onDocClick = (e) => {
      if (!themeMenuOpen) return
      if (themeMenuRef.current?.contains(e.target) || themeBtnRef.current?.contains(e.target)) return
      setThemeMenuOpen(false)
    }
    const onKey = (e) => {
      if (!themeMenuOpen) return
      if (e.key === 'Escape') {
        e.stopPropagation()
        setThemeMenuOpen(false)
        return
      }
      if (e.key === 'Tab') {
        const menu = themeMenuRef.current
        if (!menu) return
        const focusables = menu.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        const list = Array.from(focusables).filter((el) => !el.hasAttribute('disabled'))
        if (list.length === 0) return
        const current = document.activeElement
        let idx = list.indexOf(current)
        if (e.shiftKey) idx = idx <= 0 ? list.length - 1 : idx - 1
        else idx = idx === list.length - 1 ? 0 : idx + 1
        e.preventDefault()
        list[idx].focus()
      }
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [themeMenuOpen])

  // Manage initial focus when opening and restore focus when closing
  useEffect(() => {
    if (themeMenuOpen) {
      prevFocusRef.current = themeBtnRef.current || document.activeElement
      // Focus first focusable in the menu
      setTimeout(() => {
        const menu = themeMenuRef.current
        if (!menu) return
        const focusables = menu.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        const first = Array.from(focusables).find((el) => !el.hasAttribute('disabled'))
        first?.focus()
      }, 0)
    } else if (prevFocusRef.current) {
      // Return focus to the trigger button
      prevFocusRef.current.focus?.()
    }
  }, [themeMenuOpen])

  const sidebarPaddingClass = sidebarOpen ? 'lg:pl-60' : 'lg:pl-20'
  const ThemeIcon = theme === 'dark' ? Moon : theme === 'system' ? Laptop : Sun
  const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'

  useEffect(() => {
    // Adjust tooltip alignment based on button position to avoid clipping
    if (!showTip) return
    const btn = toggleRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const vw = window.innerWidth
    if (rect.left < 40) setTipAlign('left')
    else if (vw - rect.right < 40) setTipAlign('right')
    else setTipAlign('center')
  }, [showTip])

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-[110] flex h-16 items-center border-b border-gray-200 dark:border-gray-700 dark:border-gray-800 bg-white/95 dark:bg-gray-950/90 px-4 backdrop-blur transition-[padding,box-shadow,backdrop-filter] duration-200 ease-in-out motion-reduce:transition-none sm:px-6 lg:px-8 ${sidebarPaddingClass} ${
        scrolled ? 'shadow-lg shadow-black/10 dark:shadow-black/30' : ''
      }`}
      style={{ willChange: 'padding' }}
      aria-label="Top navigation"
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Small hint: press ? for help */}
          <button
            type="button"
            ref={helpBtnRef}
            className="hidden sm:inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:yc-focus yc-ink"
            aria-label="Keyboard shortcuts (press Shift + /)"
            title="Keyboard shortcuts (press Shift + /)"
            onClick={() => setHelpOpen((v) => !v)}
          >
            ?
          </button>
          <Link to="/" className="inline-flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 dark:text-gray-100 flex items-center justify-center text-xs font-semibold">
              Logo
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 dark:text-gray-100">
              {themeTransitioning ? (
                <span className="inline-block h-4 w-20 animate-pulse rounded bg-slate-200 align-middle dark:bg-slate-800" aria-hidden="true" />
              ) : (
                'YourCase'
              )}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="md"
            iconOnly
            aria-label={`Theme: ${theme}. Click to switch to ${nextTheme}`}
            title={`Theme: ${theme}. Click to switch to ${nextTheme}`}
            onClick={() => {
              setTheme(nextTheme)
              setShowTip(true)
              window.clearTimeout((tipRef.current))
              tipRef.current = window.setTimeout(() => setShowTip(false), 900)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault()
                setTheme(nextTheme)
                setShowTip(true)
                window.clearTimeout((tipRef.current))
                tipRef.current = window.setTimeout(() => setShowTip(false), 900)
              }
            }}
          >
            {themeTransitioning ? (
              <span className="inline-block h-5 w-5 animate-pulse rounded bg-slate-200 dark:bg-slate-800" aria-hidden="true" />
            ) : (
              <ThemeIcon className="h-5 w-5" />
            )}
            <span
              className="yc-tooltip left-1/2"
              style={{ top: '110%' }}
              data-show={showTip ? 'true' : 'false'}
              data-align={tipAlign}
              role="status"
              aria-live="polite"
            >
              Theme: {nextTheme}
            </span>
          </Button>
        <Button
          ref={themeBtnRef}
          variant="secondary"
          size="md"
          iconOnly
          aria-haspopup="menu"
          aria-expanded={themeMenuOpen}
          aria-label="Open theme and accent menu"
          title="Theme & Accent"
          onClick={() => setThemeMenuOpen((v) => !v)}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        {/* Quick DND toggle */}
        <label className="ml-1 inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={!!preferences.doNotDisturb}
            onChange={(e) => updatePreferences({ doNotDisturb: e.target.checked })}
            className="h-3 w-3 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-400"
            aria-label="Do Not Disturb"
          />
          DND
        </label>
          {themeMenuOpen && (
            <div
              ref={themeMenuRef}
              className="absolute right-20 top-16 z-[130] w-64 origin-top-right rounded-2xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5 dark:border-gray-800 dark:bg-slate-900 p-3 yc-pop"
              data-open={themeMenuOpen ? 'true' : 'false'}
              role="menu"
              aria-label="Theme and Accent"
              onKeyDown={(e) => {
                // Roving tabindex + arrow navigation within the menu
                const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End']
                if (!keys.includes(e.key)) return
                e.preventDefault()
                const items = Array.from(
                  themeMenuRef.current.querySelectorAll('[data-menuitem="true"]'),
                )
                if (!items.length) return
                const idx = items.indexOf(document.activeElement)
                let next = idx
                if (e.key === 'Home') next = 0
                else if (e.key === 'End') next = items.length - 1
                else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1 + items.length) % items.length
                else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + items.length) % items.length
                items.forEach((el) => el.setAttribute('tabindex', '-1'))
                items[next].setAttribute('tabindex', '0')
                items[next].focus()
              }}
            >
              <div className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Theme
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'system', label: 'System', icon: Laptop },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTheme(id)}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-2 py-2 text-xs ${
                      theme === id
                        ? 'border-accent text-accent'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    role="menuitemradio"
                    aria-checked={theme === id}
                    data-menuitem="true"
                    tabIndex={theme === id ? 0 : -1}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                    {theme === id && <Check className="ml-auto h-4 w-4" />}
                  </button>
                ))}
              </div>
              <div className="mt-4 mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Accent
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {['#4F46E5', '#22C55E', '#EF4444', '#06B6D4', '#F59E0B', '#8B5CF6'].map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    className={`h-7 w-7 rounded-full ring-2 transition hover:scale-105 ${
                      accentColor?.toLowerCase() === hex.toLowerCase() ? 'ring-accent' : 'ring-transparent'
                    }`}
                    style={{ backgroundColor: hex }}
                    aria-label={`Set accent ${hex}`}
                    onClick={async () => {
                      await navigator.clipboard?.writeText?.(hex).catch(() => {})
                      setAccentColor(hex)
                      const live = document.getElementById('yc-theme-live')
                      if (live) live.textContent = `Accent color copied and set to ${hex}`
                      toast.success('Copied accent color', { description: hex })
                    }}
                    data-menuitem="true"
                    tabIndex={accentColor?.toLowerCase() === hex.toLowerCase() ? 0 : -1}
                  />
                ))}
                <label className="ml-1 inline-flex h-7 items-center gap-2 rounded-lg border border-gray-200 px-2 text-[10px] text-gray-600 dark:border-gray-700 dark:text-gray-300">
                  Custom
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-4 w-8 cursor-pointer bg-transparent p-0"
                    aria-label="Custom accent color"
                    data-menuitem="true"
                    tabIndex={-1}
                  />
                </label>
                <button
                  type="button"
                  className="ml-2 inline-flex items-center justify-center rounded-lg border border-gray-200 px-2 py-1 text-[10px] font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  onClick={() => {
                    const def = '#4F46E5'
                    setAccentColor(def)
                    const live = document.getElementById('yc-theme-live')
                    if (live) live.textContent = 'Accent color reset to default'
                    toast('Accent reset', { description: def })
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          )}
          <button
            type="button"
            ref={toggleRef}
            className="relative rounded-lg border border-gray-200 dark:border-gray-700 dark:border-gray-800 bg-white dark:bg-slate-900 dark:bg-gray-900 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 focus-visible:yc-focus yc-ink yc-focus-anim"
            aria-label="Notifications"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent px-1 text-[0.65rem] font-semibold text-white">
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
                  className="text-xs font-medium text-accent hover:underline"
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
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-accent dark:bg-blue-500/10">
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
              <div className="border-t border-gray-100 px-4 py-3 text-center text-xs text-accent hover:opacity-80 dark:border-gray-800">
                <button type="button" className="font-medium">
                  View all activity
                </button>
              </div>
            </div>
          )}

          {/* Active route pill (keeps in sync with Sidebar) */}
          {active && (
            <div
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              aria-label={`Current section: ${active.label}`}
              role="status"
              aria-live="polite"
            >
              <active.icon className="h-3.5 w-3.5 text-accent" />
              <span>{active.label}</span>
            </div>
          )}

          {helpOpen && (
            <div
              ref={helpRef}
              role="dialog"
              aria-modal="true"
              aria-label="Keyboard shortcuts"
              className="absolute right-4 top-16 z-[125] w-96 origin-top-right rounded-2xl border border-gray-200 bg-white p-4 shadow-xl ring-1 ring-black/5 dark:border-gray-800 dark:bg-slate-900"
              onKeyDown={(e) => {
                // Redundant guard for focus trap at container level
                if (e.key !== 'Tab') return
                const list = Array.from(
                  e.currentTarget.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
                ).filter((el) => !el.hasAttribute('disabled'))
                if (list.length === 0) return
                const current = document.activeElement
                let idx = list.indexOf(current)
                if (e.shiftKey) idx = idx <= 0 ? list.length - 1 : idx - 1
                else idx = idx === list.length - 1 ? 0 : idx + 1
                e.preventDefault()
                list[idx].focus()
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Keyboard Shortcuts</p>
                <button
                  type="button"
                  className="text-xs font-medium text-accent hover:underline"
                  onClick={() => setHelpOpen(false)}
                >
                  Close (Esc)
                </button>
              </div>
              <ul className="grid grid-cols-1 gap-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800">
                  <span>Open shortcuts panel</span>
                  <kbd className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">Shift</kbd>
                  <span className="mx-1">+</span>
                  <kbd className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">/</kbd>
                </li>
                <li className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800">
                  <span>Collapse sidebar</span>
                  <kbd className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">Left Arrow</kbd>
                </li>
                <li className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800">
                  <span>Expand sidebar</span>
                  <kbd className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">Right Arrow</kbd>
                </li>
                <li className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800">
                  <span>Theme/Accent menu navigation</span>
                  <div className="flex items-center gap-1">
                    <kbd className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">↑</kbd>
                    <kbd className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">↓</kbd>
                    <kbd className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">←</kbd>
                    <kbd className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">→</kbd>
                  </div>
                </li>
                <li className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800">
                  <span>Close panels/menus</span>
                  <kbd className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">Esc</kbd>
                </li>
                <li className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800">
                  <span>Show recent toasts</span>
                  <button
                    type="button"
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs hover:bg-gray-50 focus-visible:yc-focus dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                    aria-label="Open Recent toasts in Settings"
                    title="Open Recent toasts"
                    onClick={() => {
                      setHelpOpen(false)
                      try {
                        if (location.pathname === '/settings') {
                          const el = document.getElementById('recent-toasts')
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          else window.location.hash = '#recent-toasts'
                        } else {
                          window.location.href = '/settings#recent-toasts'
                        }
                      } catch (_) {
                        window.location.href = '/settings#recent-toasts'
                      }
                    }}
                  >
                    Open
                  </button>
                </li>
              </ul>

              {/* Recent toasts quick view */}
              <div className="mt-4 rounded-xl border border-gray-100 p-3 dark:border-gray-800" aria-labelledby="recent-toasts-heading">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <p id="recent-toasts-heading" className="text-xs font-semibold text-gray-900 dark:text-gray-100">Recent toasts (session)</p>
                      {/* Last import/export badge */}
                      {(() => {
                        if (lastBadgeDismissed) return null
                        try {
                          const raw = sessionStorage.getItem('yc_toasts_last_summary')
                          if (!raw) return null
                          const s = JSON.parse(raw)
                          const mode = s.mode ? `, ${s.mode}` : ''
                          const txt = s.type === 'export'
                            ? `last: export ${s.format} · ${s.count}`
                            : s.type === 'import'
                            ? `last: import ${s.format}${mode} · kept ${s.kept}`
                            : null
                          if (!txt) return null
                          const when = (() => {
                            try { return formatTime(Number(s.ts) || Date.now()) } catch { return '' }
                          })()
                          return (
                            <span
                              className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white pl-2 pr-1 py-0.5 text-[10px] text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                              role="status"
                              aria-live="polite"
                              title={`Last ${s.type} at ${when} (click to open Settings)`}
                            >
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 hover:underline focus-visible:yc-focus"
                                aria-label="Open Recent toasts in Settings"
                                onClick={() => {
                                  try { sessionStorage.setItem('yc_settings_active', 'recent-toasts') } catch (_) {}
                                  window.location.href = '/settings#recent-toasts'
                                }}
                              >
                                {txt}
                              </button>
                              <button
                                type="button"
                                className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-500 hover:text-gray-700 focus-visible:yc-focus dark:text-gray-400 dark:hover:text-gray-200"
                                aria-label="Dismiss last summary badge"
                                onClick={() => {
                                  setLastBadgeDismissed(true)
                                  try { sessionStorage.setItem('yc_toasts_badge_dismissed', '1') } catch (_) {}
                                }}
                              >
                                ×
                              </button>
                            </span>
                          )
                        } catch {
                          return null
                        }
                      })()}
                    </div>
                    {(() => {
                      try {
                        const total = recentToasts.length
                        let arr = [...recentToasts]
                        if (showPinnedOnly) arr = arr.filter((r) => !!r.p)
                        if (qvQuery.trim().length) arr = arr.filter((r) => r.m.toLowerCase().includes(qvQuery.trim().toLowerCase()))
                        const shown = Math.min(8, arr.length)
                        const pinnedCount = arr.filter((r) => !!r.p).length
                        return (
                          <button
                            type="button"
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] transition ${
                              showPinnedOnly
                                ? 'border-accent text-accent bg-white dark:bg-gray-900'
                                : 'border-gray-200 text-gray-600 bg-white dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
                            }`}
                            title={`Showing ${shown} of ${total}; pinned ${pinnedCount}. Click to ${showPinnedOnly ? 'show all' : 'show pinned only'}.`}
                            aria-pressed={showPinnedOnly}
                            onClick={() => {
                              const v = !showPinnedOnly
                              setShowPinnedOnly(v)
                              try { sessionStorage.setItem('yc_toasts_pinned_only', v ? '1' : '0') } catch (_) {}
                              announce(v ? 'Pinned-only filter enabled' : 'Pinned-only filter disabled', { toast: { duration: 900 } })
                            }}
                          >
                            {shown}/{total} · pinned {pinnedCount}
                          </button>
                        )
                      } catch (_) {
                        return null
                      }
                    })()}
                  </div>
                <div className="flex items-center gap-3">
                  {/* Quick stats pill: shows counts and toggles pinned-only on click */}
                  <button
                    type="button"
                    className="hidden sm:inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] text-gray-700 hover:bg-gray-50 focus-visible:yc-focus dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    onClick={() => {
                      const next = !showPinnedOnly
                      setShowPinnedOnly(next)
                      try { sessionStorage.setItem('yc_toasts_pinned_only', next ? '1' : '0') } catch (_) {}
                      announce(next ? 'Pinned-only filter enabled' : 'Pinned-only filter disabled', { toast: { duration: 900 } })
                    }}
                    title="Click to toggle pinned-only"
                    aria-label="Toggle pinned-only"
                    onMouseEnter={() => setStatsTip(true)}
                    onMouseLeave={() => setStatsTip(false)}
                    onFocus={() => setStatsTip(true)}
                    onBlur={() => setStatsTip(false)}
                  >
                    {(() => {
                      // compute shown/total and pinned count from current list
                      try {
                        const total = recentToasts.length
                        const shown = showPinnedOnly ? recentToasts.filter((r) => !!r.p).length : total
                        const pinned = recentToasts.filter((r) => !!r.p).length
                        return (
                          <span>
                            {shown}/{total} · pinned {pinned}
                          </span>
                        )
                      } catch (_) {
                        return <span>—</span>
                      }
                    })()}
                    <span
                      className="yc-tooltip left-1/2"
                      style={{ top: '110%' }}
                      data-show={statsTip ? 'true' : 'false'}
                      role="status"
                      aria-live="polite"
                    >
                      Shown/Total · Pinned — click to toggle pinned-only
                    </span>
                  </button>
                    <div className="relative">
                      <input
                        type="text"
                        ref={qvInputRef}
                        value={qvQuery}
                        onChange={(e) => {
                          const v = e.target.value
                          setQvQuery(v)
                          try { sessionStorage.setItem('yc_toasts_qv_query', v) } catch (_) {}
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            e.preventDefault()
                            setQvQuery('')
                            try { sessionStorage.removeItem('yc_toasts_qv_query') } catch (_) {}
                          } else if (e.key === 'Enter') {
                            // Move focus to the first item in the list for quick keyboard actions
                            setTimeout(() => {
                              try {
                                const root = recentListRef.current
                                if (!root) return
                                const first = root.querySelector('li[tabindex="0"]') || root.querySelector('li')
                                first && first.focus()
                              } catch (_) {}
                            }, 0)
                          }
                        }}
                        placeholder="Filter…"
                        className="rounded-md border border-gray-200 bg-white pl-2 pr-6 py-1 text-[11px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-accent dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder-gray-500"
                        aria-label="Filter recent toasts"
                        title="Filter by message text"
                        aria-keyshortcuts="Enter,Esc"
                      />
                      {qvQuery && (
                        <button
                          type="button"
                          aria-label="Clear filter"
                          title="Clear filter"
                          className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-4 w-4 items-center justify-center rounded text-gray-400 hover:text-gray-700 focus-visible:yc-focus"
                          onClick={() => {
                            setQvQuery('')
                            try { sessionStorage.removeItem('yc_toasts_qv_query') } catch (_) {}
                            // Return focus to the input after clearing for quick re-entry
                            try { qvInputRef.current?.focus() } catch (_) {}
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <span
                      className="text-[10px] text-gray-500 dark:text-gray-400 hidden xs:inline"
                      aria-hidden="true"
                      title="Press Esc to clear; Enter to focus list"
                    >
                      <kbd className="rounded border border-gray-300 bg-gray-50 px-1 dark:border-gray-700 dark:bg-gray-800">Esc</kbd>
                      clears ·
                      <span className="ml-1">Enter jumps</span>
                    </span>
                    <label className="inline-flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={showPinnedOnly}
                        onChange={(e) => {
                          const v = !!e.target.checked
                          setShowPinnedOnly(v)
                          try { sessionStorage.setItem('yc_toasts_pinned_only', v ? '1' : '0') } catch (_) {}
                          announce(v ? 'Pinned-only filter enabled' : 'Pinned-only filter disabled', { toast: { duration: 900 } })
                        }}
                        className="h-3 w-3 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-400"
                      />
                      Pinned only
                    </label>
                    <label className="inline-flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300" title="Use Pinned only as default">
                      <input
                        type="checkbox"
                        checked={pinnedOnlyDefault}
                        onChange={(e) => {
                          const v = !!e.target.checked
                          setPinnedOnlyDefault(v)
                          try { localStorage.setItem('yc_toasts_pinned_only_default', v ? '1' : '0') } catch (_) {}
                          announce(v ? 'Pinned-only set as default' : 'Pinned-only default cleared', { toast: { duration: 900 } })
                        }}
                        className="h-3 w-3 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-400"
                        title="Restore as default when opening quick view"
                      />
                      Default
                      {pinnedOnlyDefault && (
                        <span className="ml-1 rounded bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300" aria-label="Pinned only default is ON" title="Pinned only default is ON">
                          default on
                        </span>
                      )}
                    </label>
                    <label className="inline-flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300" title="Filter to pinned items only">
                      <input
                        type="checkbox"
                        checked={showPinnedOnly}
                        onChange={(e) => {
                          const v = !!e.target.checked
                          setShowPinnedOnly(v)
                          try { sessionStorage.setItem('yc_toasts_pinned_only', v ? '1' : '0') } catch (_) {}
                          announce(v ? 'Pinned-only filter enabled' : 'Pinned-only filter disabled', { toast: { duration: 900 } })
                        }}
                        className="h-3 w-3 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-400"
                        title="Show pinned items only"
                      />
                      Pinned only
                    </label>
                    <label className="inline-flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300" title="Sort with pinned items first">
                      <input
                        type="checkbox"
                        checked={pinFirst}
                        onChange={(e) => {
                          const v = !!e.target.checked
                          setPinFirst(v)
                          try { sessionStorage.setItem('yc_toasts_pin_first', v ? '1' : '0') } catch (_) {}
                          announce(v ? 'Pinned first sorting enabled' : 'Pinned first sorting disabled', { toast: { duration: 900 } })
                        }}
                        className="h-3 w-3 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-400"
                        title="Show pinned items first"
                      />
                      Pin first
                    </label>
                    <label className="inline-flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300" title="Use Pin first as default">
                      <input
                        type="checkbox"
                        checked={pinFirstDefault}
                        onChange={(e) => {
                          const v = !!e.target.checked
                          setPinFirstDefault(v)
                          try { localStorage.setItem('yc_toasts_pin_first_default', v ? '1' : '0') } catch (_) {}
                          announce(v ? 'Pin-first set as default' : 'Pin-first default cleared', { toast: { duration: 900 } })
                        }}
                        className="h-3 w-3 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-400"
                      />
                      Default
                      {pinFirstDefault && (
                        <span className="ml-1 rounded bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300" aria-label="Pin first default is ON" title="Pin first default is ON">
                          default on
                        </span>
                      )}
                    </label>
                    <label className="inline-flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={pinFirst}
                        onChange={(e) => {
                          const v = !!e.target.checked
                          setPinFirst(v)
                          try { sessionStorage.setItem('yc_toasts_pin_first', v ? '1' : '0') } catch (_) {}
                          announce(v ? 'Pinned first sorting enabled' : 'Pinned first sorting disabled', { toast: { duration: 900 } })
                        }}
                        className="h-3 w-3 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-400"
                      />
                      Pin first
                    </label>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] hover:bg-gray-50 focus-visible:yc-focus dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                      aria-label="About defaults"
                      title="Defaults persist across sessions (localStorage). Session toggles override for this panel only until you close it."
                      onClick={() => {
                        announce('Defaults persist; session toggles override temporarily', { toast: { duration: 1400 } })
                      }}
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] hover:bg-gray-50 focus-visible:yc-focus dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                      onClick={() => {
                        setShowPinnedOnly(false)
                        try { sessionStorage.setItem('yc_toasts_pinned_only', '0') } catch (_) {}
                        setPinFirst(pinFirstDefault)
                        setQvQuery('')
                        try { sessionStorage.removeItem('yc_toasts_qv_query') } catch (_) {}
                        announce('Quick view reset', { toast: { duration: 900 } })
                      }}
                      aria-label="Reset quick view filters"
                      title="Reset"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] hover:bg-gray-50 focus-visible:yc-focus dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                      onClick={() => {
                        try {
                          localStorage.removeItem('yc_toasts_pinned_only_default')
                          localStorage.removeItem('yc_toasts_pin_first_default')
                        } catch (_) {}
                        setPinnedOnlyDefault(false)
                        setPinFirstDefault(true)
                        // Optionally align current view with defaults
                        setShowPinnedOnly(false)
                        setPinFirst(true)
                        try {
                          sessionStorage.removeItem('yc_toasts_pinned_only')
                          sessionStorage.removeItem('yc_toasts_pin_first')
                        } catch (_) {}
                        announce('Quick view defaults cleared', { toast: { duration: 900 } })
                      }}
                      aria-label="Reset default filters"
                      title="Reset defaults"
                    >
                      Reset defaults
                    </button>
                    <span className="hidden sm:inline-flex items-center rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300" aria-hidden="true">
                      Shortcuts: <kbd className="mx-1 rounded border border-gray-300 bg-gray-50 px-1">P</kbd> pin • <kbd className="ml-1 rounded border border-gray-300 bg-gray-50 px-1">Del</kbd> delete
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] hover:bg-gray-50 focus-visible:yc-focus dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                      aria-label="Copy recent toasts as JSON"
                      title={recentLoading ? 'Please wait…' : 'Copy as JSON'}
                      disabled={recentLoading}
                      onClick={copyJSON}
                    >
                      <Copy className="h-3.5 w-3.5" /> JSON
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] hover:bg-gray-50 focus-visible:yc-focus dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                      aria-label="Download recent toasts as CSV"
                      title={recentLoading ? 'Please wait…' : 'Download CSV'}
                      disabled={recentLoading}
                      onClick={downloadCSV}
                    >
                      <Download className="h-3.5 w-3.5" /> CSV
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] hover:bg-gray-50 focus-visible:yc-focus dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                      aria-label="Download recent toasts as ZIP"
                      title={recentLoading ? 'Please wait…' : 'Download ZIP (JSON+CSV)'}
                      disabled={recentLoading}
                      onClick={downloadZIP}
                    >
                      <Download className="h-3.5 w-3.5" /> ZIP
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] hover:bg-gray-50 focus-visible:yc-focus dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                      aria-label="Import recent toasts from JSON"
                      title={recentLoading ? 'Please wait…' : 'Import JSON'}
                      disabled={recentLoading}
                      onClick={importJSON}
                    >
                      <Upload className="h-3.5 w-3.5" /> Import
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] hover:bg-gray-50 focus-visible:yc-focus dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                      aria-label="Import recent toasts from CSV"
                      title={recentLoading ? 'Please wait…' : 'Import CSV'}
                      disabled={recentLoading}
                      onClick={importCSV}
                    >
                      <Upload className="h-3.5 w-3.5" /> CSV
                    </button>
                    <span className="mx-1 hidden sm:inline text-gray-300">|</span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] hover:bg-gray-50 focus-visible:yc-focus dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                      aria-label="Download route retry log"
                      title="Download retry log JSON"
                      onClick={() => {
                        try {
                          const raw = sessionStorage.getItem('yc_route_retry_log')
                          const arr = raw ? JSON.parse(raw) : []
                          if (!Array.isArray(arr) || arr.length === 0) {
                            announce('No retry entries found', { toast: { variant: 'error' } })
                            return
                          }
                          const blob = new Blob([JSON.stringify(arr, null, 2)], { type: 'application/json' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = 'route-retry-log.json'
                          document.body.appendChild(a)
                          a.click()
                          a.remove()
                          URL.revokeObjectURL(url)
                          announce('Downloaded retry log', { toast: { duration: 900 } })
                        } catch (_) {
                          announce('Failed to download log', { toast: { variant: 'error' } })
                        }
                      }}
                    >
                      <Download className="h-3.5 w-3.5" /> Retry log
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] hover:bg-gray-50 focus-visible:yc-focus dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                      aria-label="Copy latest retry summary"
                      title="Copy latest retry summary"
                      onClick={async () => {
                        try {
                          const raw = sessionStorage.getItem('yc_route_retry_log')
                          const arr = raw ? JSON.parse(raw) : []
                          if (!Array.isArray(arr) || arr.length === 0) {
                            announce('No retry entries found', { toast: { variant: 'error' } })
                            return
                          }
                          const retries = arr.filter((e) => e && e.action === 'retry')
                          const total = retries.length
                          const last = arr[arr.length - 1]
                          const when = last?.ts ? new Date(last.ts).toLocaleString() : '—'
                          const text = `Route retries: ${total}. Last: ${last?.action || '—'} on ${last?.label || '—'} at ${when}.`
                          await navigator.clipboard.writeText(text)
                          announce('Copied retry summary', { toast: { variant: 'success', duration: 900 } })
                        } catch (_) {
                          announce('Failed to copy summary', { toast: { variant: 'error' } })
                        }
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy summary
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] hover:bg-gray-50 focus-visible:yc-focus dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                      aria-label="Clear route retry log"
                      title="Clear retry log"
                      onClick={() => {
                        try {
                          sessionStorage.removeItem('yc_route_retry_log')
                          announce('Retry log cleared', { toast: { duration: 900 } })
                        } catch (_) {}
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Clear log
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] hover:bg-gray-50 focus-visible:yc-focus dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                      aria-label="Preview route retry log"
                      title="Preview retry log"
                      onClick={() => {
                        try {
                          const raw = sessionStorage.getItem('yc_route_retry_log')
                          const arr = raw ? JSON.parse(raw) : []
                          if (!Array.isArray(arr) || arr.length === 0) {
                            announce('No retry entries to preview', { toast: { variant: 'error' } })
                            return
                          }
                          setLogPreview(arr.slice(-5))
                          setLogPreviewOpen(true)
                        } catch (_) {
                          announce('Failed to open preview', { toast: { variant: 'error' } })
                        }
                      }}
                    >
                      <Info className="h-3.5 w-3.5" /> Preview
                    </button>
                    {exportChip && (
                      <span className="mx-1 hidden sm:inline text-gray-300">|</span>
                    )}
                    {exportChip && (
                      <div
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] dark:border-gray-700 dark:bg-gray-900"
                        title={(() => { try { return exportChip.ts ? new Date(exportChip.ts).toLocaleString() : '' } catch { return '' } })()}
                      >
                        <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] dark:bg-gray-800">Export</span>
                        <span>{exportChip.format} · items {Number(exportChip.count || 0)}</span>
                        {exportChip.ts ? (
                          <span className="rounded bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {(() => { try { return new Date(exportChip.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } catch { return '' } })()}
                          </span>
                        ) : null}
                        <button
                          type="button"
                          className="rounded px-2 py-0.5 text-[10px] text-blue-600 hover:text-blue-700 focus-visible:yc-focus"
                          title="Preview last export"
                          onClick={() => {
                            try { window.location.href = '/settings#recent-toasts' } catch {}
                            announce('Open Settings → Recent toasts to preview the last export', { toast: { duration: 1200 } })
                          }}
                        >
                          Open preview
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-5 w-5 items-center justify-center rounded-full text-gray-500 hover:text-gray-700 focus-visible:yc-focus dark:text-gray-400 dark:hover:text-gray-200"
                          aria-label="Dismiss export summary"
                          onClick={() => {
                            setExportChip(null)
                            try { sessionStorage.setItem('yc_toasts_badge_dismissed', '1') } catch {}
                          }}
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="max-h-40 overflow-auto rounded-lg border border-gray-100 dark:border-gray-800">
                  {recentLoading ? (
                    <div className="p-3" aria-busy="true" aria-live="polite">
                      <span className="sr-only">Loading recent toasts…</span>
                      <div className="animate-pulse motion-reduce:animate-none space-y-2">
                        <div className="h-4 w-48 rounded bg-gray-100 dark:bg-gray-800" />
                        <div className="h-4 w-56 rounded bg-gray-100 dark:bg-gray-800" />
                        <div className="h-4 w-40 rounded bg-gray-100 dark:bg-gray-800" />
                      </div>
                    </div>
                  ) : recentToasts.length === 0 ? (
                    <div className="p-3 text-xs text-gray-500">No recent toasts this session.</div>
                  ) : (
                    <ul ref={recentListRef} className="divide-y divide-gray-100 dark:divide-gray-800">
                      {[...recentToasts]
                        .filter((r) => (showPinnedOnly ? !!r.p : true))
                        .filter((r) => (qvQuery.trim().length ? r.m.toLowerCase().includes(qvQuery.trim().toLowerCase()) : true))
                        .sort((a, b) => (pinFirst ? ((b.p ? 1 : 0) - (a.p ? 1 : 0)) : 0))
                        .slice(0, 8)
                        .map((r, i) => (
                          <li
                            key={i}
                            className="px-3 py-2 text-[11px] rounded-md focus-visible:yc-focus"
                            tabIndex={0}
                            role="listitem"
                            aria-label={`Toast ${i + 1}. ${r.p ? 'Pinned. ' : ''}${r.m}`}
                            onKeyDown={(e) => {
                              if (e.key === 'p' || e.key === 'P') {
                                e.preventDefault()
                                const key = `${r.t}|${r.m}`
                                const next = recentToasts.map((it) => `${it.t}|${it.m}` === key ? { ...it, p: !it.p } : it)
                                persistRecent(next)
                                announce(r.p ? 'Unpinned item' : 'Pinned item', { toast: { duration: 900 } })
                              } else if (e.key === 'Delete') {
                                e.preventDefault()
                                const key = `${r.t}|${r.m}`
                                const next = recentToasts.filter((it) => `${it.t}|${it.m}` !== key)
                                persistRecent(next)
                                announce('Deleted item', { toast: { variant: 'success', duration: 900 } })
                              }
                            }}
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex-1">
                                <p className="line-clamp-2 text-gray-800 dark:text-gray-200">
                                  {r.m}
                                  {r.p && <span className="ml-1 inline-flex items-center text-[10px] text-amber-600 dark:text-amber-400">• pinned</span>}
                                </p>
                                <p className="mt-1 text-[10px] text-gray-500">{formatTime(r.t)}</p>
                              </div>
                              <div className="ml-2 flex items-center gap-1">
                                <button
                                  type="button"
                                  className="rounded border border-gray-200 bg-white px-1.5 py-1 hover:bg-gray-50 focus-visible:yc-focus dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                                  aria-label={r.p ? 'Unpin' : 'Pin'}
                                  title={r.p ? 'Unpin' : 'Pin'}
                                  onClick={() => {
                                    const key = `${r.t}|${r.m}`
                                    const next = recentToasts.map((it) =>
                                      `${it.t}|${it.m}` === key ? { ...it, p: !it.p } : it,
                                    )
                                    persistRecent(next)
                                  }}
                                >
                                  {r.p ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                                </button>
                                <button
                                  type="button"
                                  className="rounded border border-gray-200 bg-white px-1.5 py-1 hover:bg-gray-50 focus-visible:yc-focus dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                                  aria-label="Delete"
                                  title="Delete"
                                  onClick={() => {
                                    const key = `${r.t}|${r.m}`
                                    const next = recentToasts.filter((it) => `${it.t}|${it.m}` !== key)
                                    persistRecent(next)
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] hover:bg-gray-50 focus-visible:yc-focus dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                    onClick={showManageToastAndGo}
                    aria-label="Manage recent toasts in Settings"
                    title="Manage in Settings"
                  >
                    Manage in Settings
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onFileChange} />
                <input ref={fileCsvRef} type="file" accept="text/csv,.csv" className="hidden" onChange={onCsvFileChange} />
                {importOpen && (
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Import preview"
                    className="mt-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm ring-1 ring-black/5 dark:border-gray-800 dark:bg-slate-900"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">Import preview</p>
                      <label className="inline-flex items-center gap-2 text-[11px] text-gray-600 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={mergeImport}
                          onChange={(e) => setMergeImport(e.target.checked)}
                          className="h-3 w-3 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-400"
                        />
                        Merge (keep latest 10)
                      </label>
                    </div>
                    <div className="max-h-36 overflow-auto rounded border border-gray-100 dark:border-gray-800">
                      {!pendingImport || pendingImport.length === 0 ? (
                        <div className="p-3 text-[11px] text-gray-500">No rows detected.</div>
                      ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                          {pendingImport.slice(0, 6).map((r, i) => (
                            <li key={i} className="px-3 py-2 text-[11px]">
                              <p className="line-clamp-2 text-gray-800 dark:text-gray-200">{r.m}</p>
                              <p className="mt-1 text-[10px] text-gray-500">{formatTime(r.t)}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] hover:bg-gray-50 focus-visible:yc-focus dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                        onClick={() => { setImportOpen(false); setPendingImport(null) }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] hover:bg-gray-50 focus-visible:yc-focus dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                        onClick={() => {
                          if (!Array.isArray(pendingImport) || pendingImport.length === 0) { setImportOpen(false); return }
                          const existing = recentToasts.slice()
                          if (mergeImport) {
                            const merged = [...existing, ...pendingImport]
                            const map = new Map()
                            for (const r of merged) {
                              const key = `${r.t}|${r.m}`
                              if (!map.has(key)) map.set(key, r)
                            }
                            const uniq = Array.from(map.values()).sort((a, b) => a.t - b.t)
                            const last10 = uniq.slice(-10)
                            persistRecent(last10)
                            announce(`Import complete · +${pendingImport.length} new · kept ${last10.length}. Click to view.`, {
                              toast: {
                                variant: 'success',
                                duration: 2500,
                                onClick: () => {
                                  try { sessionStorage.setItem('yc_settings_active', 'recent-toasts') } catch (_) {}
                                  window.location.href = '/settings#recent-toasts'
                                },
                              },
                            })
                            try { sessionStorage.setItem('yc_toasts_last_summary', JSON.stringify({ type: 'import', format: 'json', mode: 'merge', imported: pendingImport.length, kept: last10.length, ts: Date.now() })) } catch (_) {}
                          } else {
                            const items = pendingImport.slice().sort((a, b) => a.t - b.t)
                            const last10 = items.slice(-10)
                            persistRecent(last10)
                            announce(`Import complete · parsed ${pendingImport.length} · kept ${last10.length}. Click to view.`, {
                              toast: {
                                variant: 'success',
                                duration: 2500,
                                onClick: () => {
                                  try { sessionStorage.setItem('yc_settings_active', 'recent-toasts') } catch (_) {}
                                  window.location.href = '/settings#recent-toasts'
                                },
                              },
                            })
                            try { sessionStorage.setItem('yc_toasts_last_summary', JSON.stringify({ type: 'import', format: 'json', mode: 'replace', imported: pendingImport.length, kept: last10.length, ts: Date.now() })) } catch (_) {}
                          }
                          setImportOpen(false)
                          setPendingImport(null)
                        }}
                      >
                        Import
                      </button>
                    </div>
                  </div>
                )}
                {csvMapOpen && (
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="CSV column mapping"
                    className="mt-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm ring-1 ring-black/5 dark:border-gray-800 dark:bg-slate-900"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">CSV column mapping</p>
                      <label className="inline-flex items-center gap-2 text-[11px] text-gray-600 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={mergeImport}
                          onChange={(e) => setMergeImport(e.target.checked)}
                          className="h-3 w-3 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-400"
                        />
                        Merge (keep latest 10)
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-3 text-[11px]">
                      <label className="inline-flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-300">Time</span>
                        <select
                          className="rounded border border-gray-300 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-900"
                          value={csvTimeIdx}
                          onChange={(e) => setCsvTimeIdx(Number(e.target.value))}
                        >
                          {csvHeaders.map((h, idx) => (
                            <option value={idx} key={idx}>{h}</option>
                          ))}
                        </select>
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-300">Message</span>
                        <select
                          className="rounded border border-gray-300 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-900"
                          value={csvMsgIdx}
                          onChange={(e) => setCsvMsgIdx(Number(e.target.value))}
                        >
                          {csvHeaders.map((h, idx) => (
                            <option value={idx} key={idx}>{h}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="mt-2 max-h-36 overflow-auto rounded border border-gray-100 dark:border-gray-800">
                      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                        {csvRows.slice(0, 6).map((r, i) => (
                          <li key={i} className="px-3 py-2 text-[11px]">
                            <p className="line-clamp-2 text-gray-800 dark:text-gray-200">{String(r[csvMsgIdx] ?? '')}</p>
                            <p className="mt-1 text-[10px] text-gray-500">{formatTime(Number(r[csvTimeIdx]) || Date.parse(r[csvTimeIdx]))}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] hover:bg-gray-50 focus-visible:yc-focus dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                        onClick={() => { setCsvMapOpen(false); setCsvRows([]); setCsvHeaders([]) }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] hover:bg-gray-50 focus-visible:yc-focus dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                      onClick={() => {
                        const items = csvRows
                          .map((row) => ({
                            t: Number(row[csvTimeIdx]) || Date.parse(row[csvTimeIdx]) || Date.now(),
                            m: String(row[csvMsgIdx] ?? ''),
                          }))
                          .filter((r) => r.m.trim().length > 0 && !Number.isNaN(r.t))
                        if (items.length === 0) {
                          announce('No valid rows after mapping', { toast: { variant: 'error' } })
                          return
                        }
                        const existing = recentToasts.slice()
                        if (mergeImport) {
                          const merged = [...existing, ...items]
                          const map = new Map()
                          for (const r of merged) map.set(`${r.t}|${r.m}`, r)
                          const uniq = Array.from(map.values()).sort((a, b) => a.t - b.t)
                          const last10 = uniq.slice(-10)
                          persistRecent(last10)
                          {
                            const added = items.length
                            const kept = last10.length
                            const pinned = last10.filter((r) => !!r.p).length
                            announce(`Import complete · +${added} new · kept ${kept} · pinned ${pinned}. Click to view.`, {
                              toast: {
                                variant: 'success',
                                duration: 2500,
                                onClick: () => {
                                  try { sessionStorage.setItem('yc_settings_active', 'recent-toasts') } catch (_) {}
                                  window.location.href = '/settings#recent-toasts'
                                },
                              },
                            })
                          }
                          try { sessionStorage.setItem('yc_toasts_last_summary', JSON.stringify({ type: 'import', format: 'csv', mode: 'merge', imported: items.length, kept: last10.length, ts: Date.now() })) } catch (_) {}
                        } else {
                          const sorted = items.slice().sort((a, b) => a.t - b.t)
                          const last10 = sorted.slice(-10)
                          persistRecent(last10)
                          {
                            const parsed = items.length
                            const kept = last10.length
                            const pinned = last10.filter((r) => !!r.p).length
                            announce(`Import complete · parsed ${parsed} · kept ${kept} · pinned ${pinned}. Click to view.`, {
                              toast: {
                                variant: 'success',
                                duration: 2500,
                                onClick: () => {
                                  try { sessionStorage.setItem('yc_settings_active', 'recent-toasts') } catch (_) {}
                                  window.location.href = '/settings#recent-toasts'
                                },
                              },
                            })
                          }
                          try { sessionStorage.setItem('yc_toasts_last_summary', JSON.stringify({ type: 'import', format: 'csv', mode: 'replace', imported: items.length, kept: last10.length, ts: Date.now() })) } catch (_) {}
                        }
                        setCsvMapOpen(false)
                        setCsvRows([])
                        setCsvHeaders([])
                      }}
                    >
                      Import
                    </button>
                    </div>
                  </div>
                )}
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
    {/* Modal portal sibling to header to avoid JSX nesting issues */}
    {logPreviewOpen && (
      <div className="fixed inset-0 z-[110] flex items-end justify-center md:items-center">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur" onClick={() => setLogPreviewOpen(false)} />
        <div className="relative mx-0 w-full max-w-2xl overflow-hidden rounded-t-3xl bg-white shadow-xl outline-none md:mx-4 md:rounded-3xl dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Route retry log preview</h2>
            <button
              type="button"
              className="rounded-full p-2 text-slate-400 transition hover:text-slate-600 focus-visible:yc-focus dark:text-slate-300 dark:hover:text-slate-100"
              aria-label="Close preview"
              onClick={() => setLogPreviewOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto px-6 py-6 text-slate-700 dark:text-slate-300">
            {logPreview?.length ? (
              <ul className="space-y-3">
                {logPreview.map((e, idx) => (
                  <li key={idx} className="rounded-lg border border-gray-100 p-3 text-xs dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{e.action || 'event'}</span>
                      <span className="text-gray-500">{e.ts ? new Date(e.ts).toLocaleString() : '—'}</span>
                    </div>
                    <div className="mt-1 text-gray-700 dark:text-gray-300">
                      <div>Label: <span className="text-gray-900 dark:text-gray-100">{e.label || '—'}</span></div>
                      {e.error && (
                        <div className="mt-1">
                          <div className="text-red-600 dark:text-red-400">Error: {e.error?.message || String(e.error)}</div>
                          {e.error?.stack && (
                            <pre className="mt-1 max-h-28 overflow-auto rounded bg-gray-50 p-2 text-[10px] dark:bg-gray-950">{e.error.stack}</pre>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-gray-500">No entries.</div>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs text-gray-500">Showing last {logPreview?.length || 0} entries</span>
            <div className="flex gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 focus-visible:yc-focus dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                onClick={async () => {
                  try {
                    const raw = sessionStorage.getItem('yc_route_retry_log')
                    const arr = raw ? JSON.parse(raw) : []
                    await navigator.clipboard.writeText(JSON.stringify(arr, null, 2))
                    announce('Copied full retry log', { toast: { variant: 'success', duration: 900 } })
                  } catch (_) {
                    announce('Failed to copy log', { toast: { variant: 'error' } })
                  }
                }}
              >
                <Copy className="h-4 w-4" /> Copy all
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 focus-visible:yc-focus dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                onClick={() => setLogPreviewOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

Navbar.propTypes = {
  sidebarOpen: PropTypes.bool,
}

import { useEffect, useMemo, useState } from 'react'
import { Copy, Download, RefreshCw, Search as SearchIcon, Trash2, Star, StarOff, Upload } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'

import { PageHeader } from '../components/layout/PageHeader'
import { SettingsSidebar } from '../components/settings/SettingsSidebar'
import { SettingsSection } from '../components/settings/SettingsSection'
import { ChangePasswordForm } from '../components/settings/ChangePasswordForm'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Badge } from '../components/ui/Badge'
import { Alert } from '../components/ui/Alert'
import { Progress } from '../components/ui/Progress'
import { Switch } from '../components/ui/Switch'
import { userService } from '../services/userService'
import { NotificationToggles } from '../components/settings/NotificationToggles'
import { ThemeSelector } from '../components/settings/ThemeSelector'
import { useTheme } from '../context/ThemeContext'
import { useSettingsStore } from '../store/settingsStore'
import { useLive } from '../components/ui/LiveAnnouncer'
import { Modal } from '../components/ui/Modal'
import { SkeletonRow } from '../components/ui/Skeleton'

const initialProfile = {
  firstName: 'Sahil',
  lastName: 'Kapoor',
  email: 'sahil@example.com',
  phone: '+91 99999 99999',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sahil',
  bio: 'Senior legal associate specialising in corporate compliance and AI-assisted drafting.',
  location: 'New Delhi, India',
  language: 'English',
  timezone: 'Asia/Kolkata',
}

const sessionData = [
  { id: 'browser-01', device: 'MacBook Pro', browser: 'Chrome 123', location: 'New Delhi, IN', lastActive: 'Just now', current: true },
  { id: 'browser-02', device: 'iPhone 15', browser: 'Safari', location: 'Mumbai, IN', lastActive: '2h ago' },
  { id: 'browser-03', device: 'Windows PC', browser: 'Edge', location: 'Bengaluru, IN', lastActive: 'Yesterday' },
]

const loginHistory = [
  { id: 1, date: '12 Jan 2025', time: '09:21', location: 'New Delhi, IN', device: 'Chrome · macOS', status: 'Success' },
  { id: 2, date: '11 Jan 2025', time: '22:08', location: 'Mumbai, IN', device: 'Safari · iOS', status: 'Success' },
  { id: 3, date: '10 Jan 2025', time: '14:37', location: 'Unknown', device: 'Firefox · Linux', status: 'Blocked' },
]

const teamMembers = [
  { id: 'tm-1', name: 'Riya Sharma', email: 'riya@yourcase.in', role: 'Admin', status: 'Active', lastActive: '2h ago', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=RS' },
  { id: 'tm-2', name: 'Aarav Mehta', email: 'aarav@yourcase.in', role: 'Associate', status: 'Active', lastActive: 'Yesterday', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AM' },
  { id: 'tm-3', name: 'Neha Gupta', email: 'neha@yourcase.in', role: 'Paralegal', status: 'Invited', lastActive: '—', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=NG' },
]

const pendingInvites = [
  { email: 'client@firm.com', role: 'Client', invitedAt: '5 Jan 2025' },
]

const integrations = [
  { id: 'm365', name: 'Microsoft 365', status: 'Connected', lastSynced: 'Today 10:14', description: 'Sync Word templates and Outlook calendars.' },
  { id: 'google', name: 'Google Workspace', status: 'Not connected', lastSynced: null, description: 'Sync Drive files and Gmail threads.' },
  { id: 'slack', name: 'Slack', status: 'Connected', lastSynced: 'Today 08:02', description: 'Receive AI briefings inside channels.' },
  { id: 'zapier', name: 'Zapier', status: 'Not connected', lastSynced: null, description: 'Automate workflows with 5,000+ apps.' },
]

const apiKeys = [
  { id: 'key-1', name: 'Production key', createdAt: '02 Dec 2024', lastUsed: 'Yesterday', masked: 'yc_pk_live_******9f1' },
  { id: 'key-2', name: 'Staging key', createdAt: '14 Oct 2024', lastUsed: '3 days ago', masked: 'yc_pk_test_******dd4' },
]

export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile')
  const [profile, setProfile] = useState(initialProfile)
  const [notice, setNotice] = useState(null)
  const { notifications, preferences, theme: storedTheme, accentColor: storedAccent, updateNotifications, updatePreferences, setTheme: setStoredTheme, setAccentColor: setStoredAccent } = useSettingsStore()
  const { theme, accentColor, setTheme, setAccentColor } = useTheme()
  const { announce } = useLive()

  const handleThemeChange = (value) => {
    setStoredTheme(value)
    setTheme(value)
  }

  // Toast mute toggle stored in preferences.doNotDisturb; honor in announcer via per-call option
  const toggleDnd = (value) => {
    updatePreferences({ doNotDisturb: value })
    announce(value ? 'Do Not Disturb enabled' : 'Do Not Disturb disabled', { toast: { duration: 1200 } })
  }

  useEffect(() => {
    if (storedTheme && storedTheme !== theme) {
      setTheme(storedTheme)
    }
  }, [storedTheme, theme, setTheme])

  const profileMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: () => setNotice({ type: 'success', message: 'Profile updated successfully.' }),
    onError: (error) => setNotice({ type: 'error', message: error.message || 'Failed to update profile.' }),
  })

  const passwordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }) => userService.changePassword(currentPassword, newPassword),
    onSuccess: () => setNotice({ type: 'success', message: 'Password changed successfully.' }),
    onError: (error) => setNotice({ type: 'error', message: error.message || 'Current password incorrect.' }),
  })

  useQuery({
    queryKey: ['profile'],
    queryFn: () => Promise.resolve(initialProfile),
    onSuccess: (data) => setProfile(data),
  })

  const sections = (
    <div className="space-y-8">
      <SettingsSection
        id="profile"
        title="Profile"
        description="Manage how your identity appears to clients and teammates across YourCase."
        onSave={() => profileMutation.mutate(profile)}
        saving={profileMutation.isLoading}
      >
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4">
          <img src={profile.avatar} alt={profile.firstName} className="h-20 w-20 rounded-full object-cover" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {profile.firstName} {profile.lastName}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">{profile.email}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
              <Badge variant="primary" size="sm">
                Senior Associate
              </Badge>
              <span>Member since 2021</span>
            </div>
          </div>
          <div className="ml-auto">
            <Button variant="ghost" size="sm">
              Change avatar
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="First name"
            value={profile.firstName}
            onChange={(event) => setProfile((prev) => ({ ...prev, firstName: event.target.value }))}
            required
          />
          <Input
            label="Last name"
            value={profile.lastName}
            onChange={(event) => setProfile((prev) => ({ ...prev, lastName: event.target.value }))}
            required
          />
          <Input
            label="Phone number"
            value={profile.phone}
            onChange={(event) => setProfile((prev) => ({ ...prev, phone: event.target.value }))}
          />
          <Input
            label="Avatar URL"
            value={profile.avatar}
            onChange={(event) => setProfile((prev) => ({ ...prev, avatar: event.target.value }))}
          />
          <Input
            label="Location"
            value={profile.location}
            onChange={(event) => setProfile((prev) => ({ ...prev, location: event.target.value }))}
          />
          <Input
            label="Language"
            value={profile.language}
            onChange={(event) => setProfile((prev) => ({ ...prev, language: event.target.value }))}
          />
          <Input
            label="Timezone"
            value={profile.timezone}
            onChange={(event) => setProfile((prev) => ({ ...prev, timezone: event.target.value }))}
          />
          <Textarea
            label="Bio"
            value={profile.bio}
            onChange={(event) => setProfile((prev) => ({ ...prev, bio: event.target.value }))}
            rows={3}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        id="recent-toasts"
        title="Recent toasts"
        description="Review, filter, and export the last few toast messages from this session."
      >
        {(() => {
          // Local state + helpers scoped to this section only
          const [loading, setLoading] = useState(false)
          const [query, setQuery] = useState(() => {
            try {
              const p = JSON.parse(localStorage.getItem('yc_toasts_prefs') || '{}')
              return typeof p.query === 'string' ? p.query : ''
            } catch (_) { return '' }
          })
          const [sort, setSort] = useState(() => {
            try {
              const p = JSON.parse(localStorage.getItem('yc_toasts_prefs') || '{}')
              return p.sort === 'old' ? 'old' : 'new'
            } catch (_) { return 'new' }
          }) // 'new' | 'old'
          const [rows, setRows] = useState(() => {
            try {
              const list = JSON.parse(sessionStorage.getItem('yc_toasts_recent') || '[]')
              return Array.isArray(list) ? list : []
            } catch (_) {
              return []
            }
          })
          const [showPinnedFirst, setShowPinnedFirst] = useState(() => {
            try {
              const p = JSON.parse(localStorage.getItem('yc_toasts_prefs') || '{}')
              return typeof p.showPinnedFirst === 'boolean' ? p.showPinnedFirst : true
            } catch (_) { return true }
          })
          const [showPinnedOnly, setShowPinnedOnly] = useState(() => {
            try {
              const p = JSON.parse(localStorage.getItem('yc_toasts_prefs') || '{}')
              return typeof p.showPinnedOnly === 'boolean' ? p.showPinnedOnly : false
            } catch (_) { return false }
          })
          useEffect(() => {
            try {
              const prev = JSON.parse(localStorage.getItem('yc_toasts_prefs') || '{}')
              const next = { ...prev, showPinnedFirst, showPinnedOnly, query, sort }
              localStorage.setItem('yc_toasts_prefs', JSON.stringify(next))
            } catch (_) {}
          }, [showPinnedFirst, showPinnedOnly, query, sort])

          const persist = (next) => {
            setRows(next)
            try { sessionStorage.setItem('yc_toasts_recent', JSON.stringify(next)) } catch (_) {}
          }

          const reload = () => {
            setLoading(true)
            try {
              const list = JSON.parse(sessionStorage.getItem('yc_toasts_recent') || '[]')
              persist(Array.isArray(list) ? list : [])
              setNotice({ type: 'success', message: 'Recent toasts reloaded.' })
            } catch (_) {
              persist([])
            } finally {
              // Keep skeleton visible briefly for perceived responsiveness
              window.setTimeout(() => setLoading(false), 250)
            }
          }

          const clearAll = () => {
            try {
              sessionStorage.removeItem('yc_toasts_recent')
              setRows([])
              setNotice({ type: 'success', message: 'Cleared recent toasts.' })
              announce('Recent toasts cleared', { toast: { variant: 'success' } })
            } catch (_) {}
          }

          const copyText = async (text) => {
            try {
              await navigator.clipboard.writeText(text)
              announce('Copied to clipboard', { toast: { variant: 'success', duration: 1000 } })
            } catch (_) {
              announce('Copy failed', { toast: { variant: 'error' } })
            }
          }

          const copyAll = () => {
            const list = filteredSorted()
            if (!list.length) return
            copyText(list.map((r) => r.m).join('\n'))
          }

          const [mergeImport, setMergeImport] = useState(false)
          const [importOpen, setImportOpen] = useState(false)
          const [pendingImport, setPendingImport] = useState(null)
          const [importFormat, setImportFormat] = useState('json') // 'json' | 'csv'
          const [dragOver, setDragOver] = useState(false)
          const [mappingOpen, setMappingOpen] = useState(false)
          const [mappingData, setMappingData] = useState(null) // { headers, rows } from CSV

          // Minimal CSV -> { headers, rows } parser (supports quotes and commas)
          const parseCSV = (text) => {
            const rows = []
            let row = []
            let field = ''
            let i = 0
            let inQuotes = false
            const pushField = () => { row.push(field); field = '' }
            const pushRow = () => { rows.push(row); row = [] }
            while (i < text.length) {
              const ch = text[i]
              if (inQuotes) {
                if (ch === '"') {
                  if (text[i + 1] === '"') { field += '"'; i += 2; continue } // escaped quote
                  inQuotes = false; i++; continue
                } else { field += ch; i++; continue }
              } else {
                if (ch === '"') { inQuotes = true; i++; continue }
                if (ch === ',') { pushField(); i++; continue }
                if (ch === '\n') { pushField(); pushRow(); i++; continue }
                if (ch === '\r') { i++; continue }
                field += ch; i++; continue
              }
            }
            // flush last
            pushField(); if (row.length > 1 || row[0] !== '') pushRow()
            if (rows.length === 0) return { headers: [], rows: [] }
            const headers = rows.shift().map((h) => String(h || '').trim())
            const mapped = rows.map((r) => {
              const obj = {}
              headers.forEach((h, idx) => { obj[h] = r[idx] ?? '' })
              return obj
            })
            return { headers, rows: mapped }
          }

          const importJSON = () => {
            try {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'application/json,.json'
              input.onchange = async (e) => {
                const file = e.target.files && e.target.files[0]
                if (!file) return
                try {
                  const text = await file.text()
                  const data = JSON.parse(text)
                  let items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []
                  // normalize + validate
                  items = items
                    .map((r) => ({ t: Number(r.t) || Date.now(), m: String(r.m ?? ''), p: !!r.p }))
                    .filter((r) => r.m.length > 0)
                  setPendingImport(items)
                  setImportFormat('json')
                  setImportOpen(true)
                } catch (err) {
                  announce('Failed to import JSON', { toast: { variant: 'error' } })
                } finally {
                  input.remove()
                }
              }
              document.body.appendChild(input)
              input.click()
            } catch (_) {
              announce('Failed to open file selector', { toast: { variant: 'error' } })
            }
          }

          const downloadSampleJSON = () => {
            const now = Date.now()
            const sample = {
              meta: {
                total: 3,
                pinned_count: 1,
                generated_at: new Date(now).toISOString(),
              },
              items: [
                { t: now - 600000, m: 'Example: analysis completed successfully', p: false },
                { t: now - 300000, m: 'Example: document uploaded', p: true },
                { t: now -  60000, m: 'Example: reminder created', p: false },
              ],
            }
            const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'recent-toasts.sample.json'
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
          }

          const downloadSampleCSV = () => {
            const now = Date.now()
            const rows = [
              { t: now - 600000, m: 'Example: analysis completed successfully', p: false },
              { t: now - 300000, m: 'Example: document uploaded', p: true },
              { t: now -  60000, m: 'Example: reminder created', p: false },
            ]
            const esc = (s) => {
              const v = String(s ?? '')
              return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v
            }
            const lines = ['time,message,pinned']
            for (const r of rows) {
              lines.push(`${esc(new Date(r.t).toISOString())},${esc(r.m)},${r.p ? 'true' : 'false'}`)
            }
            const csv = lines.join('\n')
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = 'recent-toasts.sample.csv'
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(a.href)
          }

          const exportJSON = () => {
            const list = filteredSorted()
            const pinned = list.filter((r) => !!r.p).length
            const payload = {
              meta: {
                total: list.length,
                pinned_count: pinned,
                generated_at: new Date().toISOString(),
              },
              items: list,
            }
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'recent-toasts.json'
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
          }

          const exportCSV = () => {
            const list = filteredSorted()
            const esc = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"'
            const pinned = list.filter((r) => !!r.p).length
            const metaHeader = ['__meta__','pinned_count','total','generated_at']
            const metaRow = ['', pinned, list.length, new Date().toISOString()]
            const header = ['time_iso','pinned','message']
            const dataRows = list.map((r) => [new Date(Number(r.t) || 0).toISOString(), r.p ? 'true' : 'false', r.m])
            const csv = [
              metaHeader.map(esc).join(','),
              metaRow.map(esc).join(','),
              '',
              header.map(esc).join(','),
              ...dataRows.map((row) => row.map(esc).join(',')),
            ].join('\n')
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'recent-toasts.csv'
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
          }

          // Download both JSON and CSV in a single ZIP (store-only)
          const exportZIP = () => {
            const list = filteredSorted()
            const esc = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"'
            const pinned = list.filter((r) => !!r.p).length
            const jsonStr = JSON.stringify({
              meta: { total: list.length, pinned_count: pinned, generated_at: new Date().toISOString() },
              items: list,
            }, null, 2)
            const metaHeader = ['__meta__','pinned_count','total','generated_at']
            const metaRow = ['', pinned, list.length, new Date().toISOString()]
            const header = ['time_iso','pinned','message']
            const dataRows = list.map((r) => [new Date(Number(r.t) || 0).toISOString(), r.p ? 'true' : 'false', r.m])
            const csvStr = [
              metaHeader.map(esc).join(','),
              metaRow.map(esc).join(','),
              '',
              header.map(esc).join(','),
              ...dataRows.map((row) => row.map(esc).join(',')),
            ].join('\n')

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
          }

          const filteredSorted = () => {
            let list = rows.slice()
            if (query.trim()) {
              const q = query.trim().toLowerCase()
              list = list.filter((r) => String(r.m || '').toLowerCase().includes(q))
            }
            if (showPinnedOnly) {
              list = list.filter((r) => !!r.p)
            }
            // Sort by pinned first (optional), then by time
            list.sort((a, b) => {
              const ap = a.p ? 1 : 0
              const bp = b.p ? 1 : 0
              if (showPinnedFirst && ap !== bp) return bp - ap
              return sort === 'new' ? (b.t - a.t) : (a.t - b.t)
            })
            // Render newest-first visually by default
            return list.slice().reverse().reverse() // no-op for clarity
          }

          const data = filteredSorted().slice().reverse() // show newest first in UI

          const formatWhen = (t) => {
            const d = new Date(Number(t) || 0)
            const now = Date.now()
            const diff = Math.max(0, now - d.getTime())
            const mins = Math.floor(diff / 60000)
            if (mins < 1) return 'just now'
            if (mins < 60) return `${mins}m ago`
            const hrs = Math.floor(mins / 60)
            if (hrs < 24) return `${hrs}h ago`
            return d.toLocaleString()
          }

          const pinnedCount = rows.reduce((n, r) => n + (r.p ? 1 : 0), 0)

          return (
          <div className="space-y-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm" aria-busy={loading}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-300">Session-only, up to last 10 messages</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={reload} title="Reload" disabled={loading} disabledTooltip="Please wait…">
                    <RefreshCw className="mr-2 h-4 w-4" /> Reload
                  </Button>
                  <Button variant="ghost" size="sm" onClick={copyAll} title="Copy all">
                    <Copy className="mr-2 h-4 w-4" /> Copy all
                  </Button>
                  <Button variant="ghost" size="sm" onClick={exportJSON} title="Export JSON">
                    <Download className="mr-2 h-4 w-4" /> Export JSON
                  </Button>
                  <Button variant="ghost" size="sm" onClick={exportCSV} title="Export CSV">
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                  </Button>
                  <Button variant="ghost" size="sm" onClick={exportZIP} title="Download both (ZIP)">
                    <Download className="mr-2 h-4 w-4" /> Download ZIP
                  </Button>
                  <Button variant="ghost" size="sm" onClick={downloadSampleJSON} title="Download sample JSON template">
                    <Download className="mr-2 h-4 w-4" /> Sample JSON
                  </Button>
                  <Button variant="ghost" size="sm" onClick={downloadSampleCSV} title="Download sample CSV template">
                    <Download className="mr-2 h-4 w-4" /> Sample CSV
                  </Button>
                  <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 ml-1">
                    <input
                      type="checkbox"
                      checked={mergeImport}
                      onChange={(e) => {
                        setMergeImport(e.target.checked)
                        announce(e.target.checked ? 'Merge import enabled' : 'Merge import disabled', { toast: { duration: 900 } })
                      }}
                      className="h-3 w-3 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-400"
                    />
                    Merge import
                  </label>
                  <Button variant="ghost" size="sm" onClick={importJSON} title={mergeImport ? 'Import JSON (merge, keep latest 10)' : 'Import JSON (replace up to 10)'}>
                    <Upload className="mr-2 h-4 w-4" /> Import JSON
                  </Button>
                  {importOpen && (
                    <ImportPreviewModal
                      open={importOpen}
                      onClose={() => { setImportOpen(false); setPendingImport(null) }}
                      onConfirm={() => {
                        if (!pendingImport || !Array.isArray(pendingImport)) { setImportOpen(false); return }
                        if (mergeImport) {
                          const merged = [...rows, ...pendingImport]
                          const byKey = new Map()
                          for (const r of merged) {
                            const key = `${r.t}|${r.m}`
                            if (!byKey.has(key)) byKey.set(key, r)
                            else {
                              const prev = byKey.get(key)
                              byKey.set(key, { ...prev, p: !!(prev.p || r.p) })
                            }
                          }
                          const uniq = Array.from(byKey.values()).sort((a, b) => a.t - b.t)
                          const last10 = uniq.slice(-10)
                          persist(last10)
                          announce(`Imported ${pendingImport.length} and merged → ${last10.length} kept (latest 10)`, { toast: { variant: 'success' } })
                          try { sessionStorage.setItem('yc_toasts_last_summary', JSON.stringify({ type: 'import', format: importFormat, mode: 'merge', imported: pendingImport.length, kept: last10.length, ts: Date.now() })) } catch (_) {}
                        } else {
                          const items = pendingImport.slice().sort((a, b) => a.t - b.t)
                          const last10 = items.slice(-10)
                          persist(last10)
                          announce(`Imported ${last10.length} toast${last10.length === 1 ? '' : 's'}`, { toast: { variant: 'success' } })
                          try { sessionStorage.setItem('yc_toasts_last_summary', JSON.stringify({ type: 'import', format: importFormat, mode: 'replace', imported: pendingImport.length, kept: last10.length, ts: Date.now() })) } catch (_) {}
                        }
                        setImportOpen(false)
                        setPendingImport(null)
                      }}
                      items={pendingImport}
                      merge={mergeImport}
                      currentRows={rows}
                      format={importFormat}
                    />
                  )}
                  {mappingOpen && mappingData && (
                    <CSVMappingModal
                      open={mappingOpen}
                      onClose={() => { setMappingOpen(false); setMappingData(null) }}
                      onConfirm={(mappedItems) => {
                        setMappingOpen(false)
                        setMappingData(null)
                        setPendingImport(mappedItems)
                        setImportFormat('csv')
                        setImportOpen(true)
                      }}
                      headers={mappingData.headers}
                      rows={mappingData.rows}
                    />
                  )}
                  <Button variant="danger" size="sm" onClick={clearAll} title="Clear all">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search messages"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-9 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                  <SearchIcon className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setQuery('')
                      setSort('new')
                      setShowPinnedFirst(true)
                      setShowPinnedOnly(false)
                      announce('Filters reset', { toast: { duration: 900 } })
                    }}
                    title="Reset filters"
                    aria-label="Reset filters to default"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Reset
                  </Button>
                  <label htmlFor="toast-sort" className="text-xs text-slate-500 dark:text-slate-400">Sort</label>
                  <select
                    id="toast-sort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm"
                  >
                    <option value="new">Newest first</option>
                    <option value="old">Oldest first</option>
                  </select>
                  <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={showPinnedFirst}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setShowPinnedFirst(checked)
                        announce(checked ? 'Pinned items are shown first' : 'Pinned priority disabled', { toast: { duration: 900 } })
                      }}
                      aria-controls="recent-toasts-list"
                      className="h-3 w-3 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-400"
                    />
                    Pin first
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={showPinnedOnly}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setShowPinnedOnly(checked)
                        const total = rows.length
                        const pinned = rows.filter((r) => !!r.p).length
                        announce(
                          checked ? `Showing only pinned (${pinned} of ${total})` : 'Showing all messages',
                          { toast: { duration: 900 } }
                        )
                      }}
                      aria-controls="recent-toasts-list"
                      className="h-3 w-3 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-400"
                    />
                    Show pinned only
                  </label>
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300"
                    aria-live="polite"
                  >
                    Pinned {pinnedCount} / Total {rows.length}
                  </span>
                  {showPinnedOnly && filteredSorted().length > 0 && (() => {
                    const [confirmOpen, setConfirmOpen] = useState(false)
                    return (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmOpen(true)}
                          aria-label="Unpin all pinned toasts"
                          title="Unpin all"
                        >
                          <StarOff className="mr-2 h-4 w-4" /> Unpin all
                        </Button>
                        <ConfirmUnpinAllModal
                          open={confirmOpen}
                          onClose={() => setConfirmOpen(false)}
                          onConfirm={() => {
                            const next = rows.map((r) => ({ ...r, p: false }))
                            persist(next)
                            setConfirmOpen(false)
                            announce('Unpinned all toasts', { toast: { duration: 1000 } })
                          }}
                          count={filteredSorted().length}
                        />
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* Drag-and-drop import area */}
              <div
                className={`mt-3 rounded-2xl border-2 border-dashed px-4 py-6 text-center text-sm transition-colors ${
                  dragOver
                    ? 'border-accent bg-accent/5'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
                role="button"
                tabIndex={0}
                onClick={importJSON}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    importJSON()
                  }
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={async (e) => {
                  e.preventDefault();
                  setDragOver(false)
                  try {
                    const file = e.dataTransfer?.files?.[0]
                    if (!file) return
                    const name = (file.name || '').toLowerCase()
                    const text = await file.text()
                    if (name.endsWith('.csv') || file.type === 'text/csv') {
                      const parsed = parseCSV(text)
                      if (!parsed.headers.length || !parsed.rows.length) {
                        announce('CSV appears empty or has no header row', { toast: { variant: 'error' } })
                        return
                      }
                      setMappingData(parsed)
                      setMappingOpen(true)
                    } else if (name.endsWith('.json') || file.type === 'application/json') {
                      const data = JSON.parse(text)
                      let items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []
                      items = items
                        .map((r) => ({ t: Number(r.t) || Date.now(), m: String(r.m ?? ''), p: !!r.p }))
                        .filter((r) => r.m.length > 0)
                      setPendingImport(items)
                      setImportFormat('json')
                      setImportOpen(true)
                    } else {
                      announce('Unsupported file. Drop a JSON or CSV file.', { toast: { variant: 'error' } })
                    }
                  } catch (_) {
                    announce('Failed to read dropped file', { toast: { variant: 'error' } })
                  }
                }}
                aria-label="Drag and drop JSON here, or press Enter to choose a file"
              >
                <p className="text-slate-600 dark:text-slate-300">
                  Drag & drop a JSON or CSV file here, or click to select JSON.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {mergeImport ? 'Merge enabled: file will be merged and latest 10 kept.' : 'Replace mode: file will replace current list (latest 10 kept).'}
                </p>
              </div>

              {loading ? (
                <div aria-live="polite">
                  <span className="sr-only">Loading recent toasts…</span>
                  <div className="space-y-2">
                    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2">
                      <SkeletonRow className="h-4 w-2/3" />
                      <SkeletonRow className="h-3 w-1/3 mt-2" />
                    </div>
                    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2">
                      <SkeletonRow className="h-4 w-1/2" />
                      <SkeletonRow className="h-3 w-1/4 mt-2" />
                    </div>
                    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2">
                      <SkeletonRow className="h-4 w-3/5" />
                      <SkeletonRow className="h-3 w-1/3 mt-2" />
                    </div>
                  </div>
                </div>
              ) : (
                <ul id="recent-toasts-list" className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  {data.length === 0 ? (
                    <li className="text-slate-500 dark:text-slate-400">No toasts recorded.</li>
                  ) : (
                    data.map((t, idx) => (
                      <li key={`${t.t}-${idx}`} className="group flex items-center justify-between gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="truncate" title={t.m}>{t.m}</span>
                            {t.p && (
                              <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                                Pinned
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{formatWhen(t.t)}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => copyText(t.m)}
                            aria-label="Copy this toast message"
                            title="Copy message"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => {
                              const list = rows.slice()
                              const i = list.findIndex((r) => r.t === t.t && r.m === t.m)
                              if (i !== -1) {
                                list[i] = { ...list[i], p: !list[i].p }
                                persist(list)
                                announce(list[i].p ? 'Pinned toast' : 'Unpinned toast', { toast: { duration: 900 } })
                              }
                            }}
                            aria-label={t.p ? 'Unpin toast' : 'Pin toast'}
                            title={t.p ? 'Unpin' : 'Pin'}
                          >
                            <Star className={`h-4 w-4 ${t.p ? 'text-accent' : 'opacity-70 group-hover:opacity-100'}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => {
                              const list = rows.slice()
                              const i = list.findIndex((r) => r.t === t.t && r.m === t.m)
                              if (i !== -1) {
                                list.splice(i, 1)
                                persist(list)
                                announce('Toast deleted', { toast: { variant: 'success', duration: 900 } })
                              }
                            }}
                            aria-label="Delete toast"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          )
        })()}
      </SettingsSection>

      <SettingsSection
        id="account"
        title="Account"
        description="Control your account credentials, subscription, and identification."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Account information</h4>
            <dl className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex justify-between"><dt>User ID</dt><dd>#YC-02948</dd></div>
              <div className="flex justify-between"><dt>Email</dt><dd>{profile.email}</dd></div>
              <div className="flex justify-between"><dt>Account type</dt><dd>Professional</dd></div>
              <div className="flex justify-between"><dt>Subscription</dt><dd>Enterprise annual</dd></div>
            </dl>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-amber-800">Delete account</h4>
            <p className="mt-2 text-xs text-amber-700">
              Deleting your account removes all matters, templates, and analytics permanently. This action cannot be undone.
            </p>
            <Button variant="danger" size="sm" className="mt-4">
              Delete account
            </Button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="security" title="Security" description="Protect your account with strong passwords and multi-factor authentication.">
        <ChangePasswordForm onChangePassword={passwordMutation.mutate} loading={passwordMutation.isLoading} />
      </SettingsSection>

      <SettingsSection
        id="notifications"
        title="Notifications"
        description="Choose how YourCase keeps you informed about matters and activity."
        onSave={() => userService.updateNotificationSettings(notifications).then(() => setNotice({ type: 'success', message: 'Notification preferences saved.' }))}
      >
        <NotificationToggles
          groups={[
            {
              title: 'Email alerts',
              items: [
                { id: 'queryResponses', label: 'Query responses', description: 'Receive alerts when AI finishes answering a query.', enabled: notifications.queryResponses },
                { id: 'documentAnalysis', label: 'Document analysis', description: 'Notified when AI completes document review.', enabled: notifications.documentAnalysis },
                { id: 'matterUpdates', label: 'Matter updates', description: 'Changes to matters you follow.', enabled: notifications.matterUpdates },
                { id: 'teamMentions', label: 'Team mentions', description: 'When collaborators mention you.', enabled: notifications.teamMentions },
                { id: 'weeklySummary', label: 'Weekly summary', description: 'Highlights from the past week.', enabled: notifications.weeklySummary },
                { id: 'marketing', label: 'Product updates & offers', enabled: notifications.marketing },
              ],
            },
            {
              title: 'In-app notifications',
              items: [
                { id: 'push', label: 'Push notifications', enabled: notifications.push },
                { id: 'sound', label: 'Sound alerts', enabled: notifications.sound },
                { id: 'desktop', label: 'Desktop notifications', enabled: notifications.desktop },
              ],
            },
          ]}
          onChange={(id, value) => updateNotifications({ [id]: value })}
        />
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 shadow-sm">
          <span className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Frequency</span>
          {['instant', 'daily', 'weekly'].map((option) => (
            <button
              key={option}
              type="button"
              className={`rounded-full border px-3 py-1 text-xs transition ${
                notifications.frequency === option ? 'border-blue-200 bg-blue-50 text-blue-600 shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800'
              }`}
              onClick={() => updateNotifications({ frequency: option })}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)} digest
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        id="preferences"
        title="Preferences"
        description="Customise AI behaviour, UI, and regional formatting."
        onSave={() => userService.updatePreferences(preferences).then(() => setNotice({ type: 'success', message: 'Preferences updated.' }))}
      >
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI preferences</h4>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Default model</label>
                <select
                  value={preferences.aiModel}
                  onChange={(event) => updatePreferences({ aiModel: event.target.value })}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-600 dark:text-slate-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
                >
                  <option value="Gemini Pro">Gemini Pro</option>
                  <option value="Gemini Flash">Gemini Flash</option>
                  <option value="GPT-4.1">GPT-4.1</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Temperature ({preferences.temperature})</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={preferences.temperature}
                  onChange={(event) => updatePreferences({ temperature: Number(event.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Max tokens ({preferences.maxTokens})</label>
                <input
                  type="range"
                  min="512"
                  max="4096"
                  step="256"
                  value={preferences.maxTokens}
                  onChange={(event) => updatePreferences({ maxTokens: Number(event.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Default query type</label>
                <select
                  value={preferences.defaultQueryType}
                  onChange={(event) => updatePreferences({ defaultQueryType: event.target.value })}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-600 dark:text-slate-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
                >
                  <option>Summary</option>
                  <option>Draft response</option>
                  <option>Legal research</option>
                  <option>Clause analysis</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">UI preferences</h4>
            <ThemeSelector value={theme} onChange={handleThemeChange} />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 shadow-sm">
              Compact mode
              <Switch checked={preferences.compactMode} onCheckedChange={(value) => updatePreferences({ compactMode: value })} />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 shadow-sm">
              Do Not Disturb (mute toasts)
              <Switch checked={preferences.doNotDisturb} onCheckedChange={toggleDnd} />
            </label>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Default view</label>
                <select
                  value={preferences.defaultView}
                  onChange={(event) => updatePreferences({ defaultView: event.target.value })}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-600 dark:text-slate-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
                >
                  <option value="grid">Grid</option>
                  <option value="list">List</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Regional settings</h4>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <Input
                label="Language"
                value={preferences.language}
                onChange={(event) => updatePreferences({ language: event.target.value })}
              />
              <Input
                label="Timezone"
                value={preferences.timezone}
                onChange={(event) => updatePreferences({ timezone: event.target.value })}
              />
              <Input
                label="Date format"
                value={preferences.dateFormat}
                onChange={(event) => updatePreferences({ dateFormat: event.target.value })}
              />
              <Input
                label="Currency"
                value={preferences.currency}
                onChange={(event) => updatePreferences({ currency: event.target.value })}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Editor preferences</h4>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <Input
                label="Font size"
                type="number"
                value={preferences.editorFontSize}
                onChange={(event) => updatePreferences({ editorFontSize: Number(event.target.value) })}
              />
              <Input
                label="Line spacing"
                type="number"
                step="0.1"
                value={preferences.editorLineSpacing}
                onChange={(event) => updatePreferences({ editorLineSpacing: Number(event.target.value) })}
              />
              <label className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 shadow-sm md:col-span-2">
                Auto-save drafts
                <Switch checked={preferences.autoSave} onCheckedChange={(value) => updatePreferences({ autoSave: value })} />
              </label>
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="billing" title="Billing" description="Review plan details, usage metrics, and invoices.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <header className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Professional plan</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Billed annually • Next billing 12 Jan 2026</p>
              </div>
              <Button variant="secondary" size="sm">
                Upgrade
              </Button>
            </header>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">₹8,499<span className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">/month</span></p>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span>API calls</span>
                  <span>32,000 / 50,000</span>
                </div>
                <Progress value={64} className="mt-1" />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span>Storage</span>
                  <span>62 GB / 100 GB</span>
                </div>
                <Progress value={62} className="mt-1" />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                <span>Team members</span>
                <span>18 / 25</span>
              </div>
            </div>
          </div>
          <div className="space-y-4 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Payment method</h4>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
              <span>Visa ending •••• 4242</span>
              <span>Expires 03/27</span>
            </div>
            <Button variant="ghost" size="sm">
              Update payment method
            </Button>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Billing history</h4>
          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { date: '12 Dec 2024', amount: '₹8,499', status: 'Paid' },
                  { date: '12 Nov 2024', amount: '₹8,499', status: 'Paid' },
                  { date: '12 Oct 2024', amount: '₹8,499', status: 'Paid' },
                ].map((invoice) => (
                  <tr key={invoice.date}>
                    <td className="px-4 py-3">{invoice.date}</td>
                    <td className="px-4 py-3">{invoice.amount}</td>
                    <td className="px-4 py-3">{invoice.status}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="team" title="Team" description="Manage workspace members, roles, and invitations.">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Team members</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Active colleagues who can access this workspace.</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setNotice({ type: 'info', message: 'Invitations coming soon.' })}>
              Invite member
            </Button>
          </div>
          <div className="mt-4 space-y-2">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                <img src={member.avatar} alt={member.name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{member.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{member.email}</p>
                </div>
                <Badge variant="secondary" size="sm">
                  {member.role}
                </Badge>
                <span className="text-xs text-slate-400 dark:text-slate-500">Last active {member.lastActive}</span>
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    Edit role
                  </Button>
                  <Button variant="ghost" size="sm">
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Pending invitations</h4>
          <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {pendingInvites.map((invite) => (
              <div key={invite.email} className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{invite.email}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Role: {invite.role}</p>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500">Invited {invite.invitedAt}</span>
              </div>
            ))}
            {pendingInvites.length === 0 && <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">No pending invitations.</p>}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Team settings</h4>
          <label className="mt-3 flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
            Allow members to invite others
            <Switch checked onCheckedChange={() => setNotice({ type: 'info', message: 'Team settings coming soon.' })} />
          </label>
          <div className="mt-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Default role</label>
            <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-600 dark:text-slate-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none">
              <option>Associate</option>
              <option>Paralegal</option>
              <option>Viewer</option>
            </select>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="integrations" title="Integrations" description="Connect YourCase with third-party platforms and webhooks.">
        <div className="grid gap-4 md:grid-cols-2">
          {integrations.map((integration) => (
            <div key={integration.id} className="space-y-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{integration.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{integration.description}</p>
                </div>
                <Badge variant={integration.status === 'Connected' ? 'success' : 'secondary'} size="sm">
                  {integration.status}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                <span>Last synced {integration.lastSynced || '—'}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="primary" size="sm">
                  {integration.status === 'Connected' ? 'Manage' : 'Connect'}
                </Button>
                {integration.status === 'Connected' && (
                  <Button variant="ghost" size="sm">
                    Disconnect
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Webhooks</h4>
          <Input label="Webhook URL" placeholder="https://example.com/webhook" />
          <Textarea label="Events" placeholder="document.created, matter.updated" rows={2} />
          <div className="flex flex-wrap items-center gap-2">
            <Input label="Secret" placeholder="Auto-generated secret" />
            <Button variant="secondary" size="sm">
              Test webhook
            </Button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="api" title="API Keys" description="Generate and manage API credentials for automations.">
        <div className="space-y-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Keys</h4>
            <Button variant="primary" size="sm">
              Generate key
            </Button>
          </div>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{key.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Created {key.createdAt} · Last used {key.lastUsed}</p>
                </div>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{key.masked}</span>
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    Copy
                  </Button>
                  <Button variant="ghost" size="sm">
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
            Need help? Read the <a href="#" className="text-blue-600">API documentation</a>.
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="about" title="About" description="Release notes, server status, and support resources.">
        <div className="space-y-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3 text-sm text-slate-600 dark:text-slate-300">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Version</p>
              <p className="text-slate-900 dark:text-slate-100">v1.8.2</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Last updated</p>
              <p className="text-slate-900 dark:text-slate-100">09 Jan 2025</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Server status</p>
              <Badge variant="success" size="sm">
                All systems operational
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-blue-600">
            <a href="#" className="hover:underline">Documentation</a>
            <a href="#" className="hover:underline">Support</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Changelog</a>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary">Contact support</Button>
            <Button variant="ghost">Check for updates</Button>
          </div>
        </div>
      </SettingsSection>

    </div>
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title="Workspace settings"
        description="Fine-tune your YourCase experience, security, and team controls."
        breadcrumbs={<span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Dashboard · Settings</span>}
      />

      {notice && (
        <Alert
          variant={notice.type === 'error' ? 'error' : notice.type === 'success' ? 'success' : 'info'}
          title={notice.type === 'success' ? 'Saved' : notice.type === 'error' ? 'Update failed' : 'Notice'}
          message={notice.message}
          dismissible
          onClose={() => setNotice(null)}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {!isMobile && (
          <aside className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <SettingsSidebar active={activeSection} onChange={setActiveSection} />
          </aside>
        )}
        <main className="space-y-8">{sections}</main>
      </div>
    </div>
  )
}

function ConfirmUnpinAllModal({ open, onClose, onConfirm, count }) {
  if (!open) return null
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Unpin all pinned toasts?"
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>Unpin all</Button>
        </div>
      }
    >
      <p className="text-sm">This will remove the pin from {count} toast{count === 1 ? '' : 's'}. You can pin them again later.</p>
    </Modal>
  )
}

function ImportPreviewModal({ open, onClose, onConfirm, items = [], merge = false, currentRows = [] }) {
  if (!open) return null
  const examples = (items || []).slice(0, 5)
  const pinnedCount = (items || []).filter((r) => !!r.p).length
  const total = (items || []).length
  let mergedCount = total
  if (merge && Array.isArray(currentRows)) {
    const byKey = new Set(currentRows.map((r) => `${r.t}|${r.m}`))
    mergedCount = total - items.filter((r) => byKey.has(`${r.t}|${r.m}`)).length
  }
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Import preview"
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm}>Apply import</Button>
        </div>
      }
    >
      <div className="space-y-3 text-sm">
        <p className="text-slate-600 dark:text-slate-300">
          File contains <strong>{total}</strong> toast{total === 1 ? '' : 's'} ({pinnedCount} pinned){merge ? `; ${mergedCount} new after merge` : ''}.
          Only the latest 10 will be kept.
        </p>
        {examples.length > 0 && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
            <p className="mb-2 text-xs font-medium text-slate-500">Sample</p>
            <ul className="space-y-1">
              {examples.map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-3">
                  <span className="truncate" title={r.m}>{r.m}</span>
                  <span className="text-xs text-slate-400">{new Date(Number(r.t) || 0).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  )
}

function CSVMappingModal({ open, onClose, onConfirm, headers = [], rows = [] }) {
  const [timeKey, setTimeKey] = useState('')
  const [messageKey, setMessageKey] = useState('')
  const [pinnedKey, setPinnedKey] = useState('')
  const [dateFmt, setDateFmt] = useState('auto') // auto | epoch_ms | epoch_s | dd/MM/yyyy | MM/dd/yyyy | yyyy-MM-dd | ISO
  const [errors, setErrors] = useState({ mapped: false, time: false, message: false })
  if (!open) return null
  const sample = rows.slice(0, 3)

  // Restore last-used mapping + date format; otherwise guess by header names
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('yc_csv_mapping') || '{}')
      if (saved && Array.isArray(headers) && headers.length) {
        if (headers.includes(saved.timeKey)) setTimeKey(saved.timeKey)
        if (headers.includes(saved.messageKey)) setMessageKey(saved.messageKey)
        if (!saved.pinnedKey || headers.includes(saved.pinnedKey)) setPinnedKey(saved.pinnedKey || '')
        if (saved.dateFmt) setDateFmt(saved.dateFmt)
      } else {
        const lower = headers.map((h) => String(h).toLowerCase())
        const guessMsgIdx = lower.findIndex((h) => h.includes('message') || h.includes('text') || h.includes('msg'))
        const guessTimeIdx = lower.findIndex((h) => h.includes('time') || h.includes('date') || h.includes('timestamp'))
        const guessPinIdx = lower.findIndex((h) => h.includes('pin') || h.includes('star') || h.includes('fav'))
        if (guessMsgIdx >= 0) setMessageKey(headers[guessMsgIdx])
        if (guessTimeIdx >= 0) setTimeKey(headers[guessTimeIdx])
        if (guessPinIdx >= 0) setPinnedKey(headers[guessPinIdx])
      }
    } catch (_) {}
  // re-run when opening with new headers
  }, [open, headers])

  const parseByFmt = (val) => {
    if (val == null || val === '') return NaN
    const s = typeof val === 'string' ? val.trim() : val
    if (dateFmt === 'epoch_ms') {
      const n = Number(s)
      return Number.isFinite(n) ? n : NaN
    }
    if (dateFmt === 'epoch_s') {
      const n = Number(s)
      return Number.isFinite(n) ? n * 1000 : NaN
    }
    const num = Number(s)
    if (dateFmt === 'auto') {
      if (Number.isFinite(num)) {
        // Heuristic: large numbers are ms, smaller look like seconds
        return num > 1e11 ? num : num * 1000
      }
      const p = Date.parse(String(s))
      return Number.isFinite(p) ? p : NaN
    }
    if (dateFmt === 'ISO') {
      const p = Date.parse(String(s))
      return Number.isFinite(p) ? p : NaN
    }
    // Pattern-based parsing with optional time component
    const str = String(s)
    let m
    if (dateFmt === 'dd/MM/yyyy') {
      m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/)
      if (m) {
        const [, d, mo, y, hh='0', mm='0', ss='0'] = m
        const dt = new Date(Number(y), Number(mo) - 1, Number(d), Number(hh), Number(mm), Number(ss))
        return dt.getTime()
      }
    } else if (dateFmt === 'MM/dd/yyyy') {
      m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/)
      if (m) {
        const [, mo, d, y, hh='0', mm='0', ss='0'] = m
        const dt = new Date(Number(y), Number(mo) - 1, Number(d), Number(hh), Number(mm), Number(ss))
        return dt.getTime()
      }
    } else if (dateFmt === 'yyyy-MM-dd') {
      m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/)
      if (m) {
        const [, y, mo, d, hh='0', mm='0', ss='0'] = m
        const dt = new Date(Number(y), Number(mo) - 1, Number(d), Number(hh), Number(mm), Number(ss))
        return dt.getTime()
      }
    }
    return NaN
  }
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Map CSV columns"
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => {
              try {
                const mapped = rows
                  .map((r) => {
                    const rawVal = timeKey ? r[timeKey] : ''
                    let t = Date.now()
                    if (timeKey) {
                      const ms = parseByFmt(rawVal)
                      t = Number.isFinite(ms) ? ms : Date.now()
                    }
                    const m = messageKey ? String(r[messageKey] ?? '') : ''
                    const v = String(pinnedKey ? (r[pinnedKey] ?? '') : '').trim().toLowerCase()
                    const p = ['true','1','yes','y','on'].includes(v) ? true : false
                    return { t, m, p }
                  })
                  .filter((r) => r.m.length > 0)
                if (!messageKey) {
                  setErrors((e) => ({ ...e, message: true }))
                  return
                }
                if (timeKey) {
                  const invalid = rows.some((r) => !Number.isFinite(parseByFmt(r[timeKey])))
                  if (invalid) {
                    setErrors((e) => ({ ...e, time: true }))
                    return
                  }
                }
                if (mapped.length === 0) {
                  setErrors((e) => ({ ...e, mapped: true }))
                  return
                }

                onConfirm(mapped)
                try {
                  localStorage.setItem('yc_csv_mapping', JSON.stringify({ timeKey, messageKey, pinnedKey, dateFmt }))
                } catch (_) {}
              } catch (_) {
                // fallthrough
              }
            }}
            disabled={!messageKey}
          >
            Continue
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Time column</label>
            <select className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm" value={timeKey} onChange={(e) => { setTimeKey(e.target.value); setErrors((x)=>({...x, time:false, mapped:false})) }}>
              <option value="">(use now)</option>
              {headers.map((h) => (<option key={h} value={h}>{h}</option>))}
            </select>
            {errors.time && (
              <p className="mt-1 text-[11px] text-amber-600">Some values in the selected time column don’t match the chosen date format.</p>
            )}
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Tip: ISO 8601 datetimes are recommended (e.g., 2025-01-01T12:34:56Z). If parsing fails, current time is used.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Message column</label>
            <select className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm" value={messageKey} onChange={(e) => { setMessageKey(e.target.value); setErrors((x)=>({...x, message:false, mapped:false})) }}>
              <option value="" disabled>(required)</option>
              {headers.map((h) => (<option key={h} value={h}>{h}</option>))}
            </select>
            {errors.message && (
              <p className="mt-1 text-[11px] text-amber-600">Select the message column to continue.</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Pinned column</label>
            <select className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm" value={pinnedKey} onChange={(e) => setPinnedKey(e.target.value)}>
              <option value="">(none)</option>
              {headers.map((h) => (<option key={h} value={h}>{h}</option>))}
            </select>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Accepted values: true/false, 1/0, yes/no, y/n, on/off (case-insensitive)
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Date format</label>
            <select className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm" value={dateFmt} onChange={(e) => { setDateFmt(e.target.value); setErrors((x)=>({...x, time:false, mapped:false})) }}>
              <option value="auto">Auto (detect)</option>
              <option value="epoch_ms">Epoch (ms)</option>
              <option value="epoch_s">Epoch (s)</option>
              <option value="dd/MM/yyyy">dd/MM/yyyy</option>
              <option value="MM/dd/yyyy">MM/dd/yyyy</option>
              <option value="yyyy-MM-dd">yyyy-MM-dd</option>
              <option value="ISO">ISO 8601</option>
            </select>
          </div>
        </div>
        {errors.mapped && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
            No rows could be mapped. Ensure the message column is correct and date format matches your time column.
          </div>
        )}
        {sample.length > 0 && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
            <p className="mb-2 text-xs font-medium text-slate-500">CSV sample</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr>
                    {headers.map((h) => (<th key={h} className="px-2 py-1 text-slate-500">{h}</th>))}
                  </tr>
                </thead>
                <tbody>
                  {sample.map((r, i) => (
                    <tr key={i}>
                      {headers.map((h) => (<td key={h} className="px-2 py-1 text-slate-600 dark:text-slate-300">{String(r[h] ?? '')}</td>))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

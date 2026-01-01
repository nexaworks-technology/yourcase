import PropTypes from 'prop-types'
import { Component, useState } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { Suspense } from 'react'
import { useLive } from './ui/LiveAnnouncer'
import { Button } from './ui/Button'
import { Alert } from './ui/Alert'

function Loader({ label = 'Loading…' }) {
  return (
    <div className="p-6" role="status" aria-live="polite">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" aria-hidden="true" />
        <div className="h-3 w-72 rounded bg-slate-200 dark:bg-slate-800" aria-hidden="true" />
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="h-24 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" aria-hidden="true" />
          <div className="h-24 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" aria-hidden="true" />
          <div className="h-24 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" aria-hidden="true" />
        </div>
        <span className="sr-only">{label}</span>
      </div>
    </div>
  )
}

Loader.propTypes = {
  label: PropTypes.string,
}

class Boundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      showDetails: false,
      attempt: 0,
      waiting: false,
      waitMs: 0,
      isOnline: typeof navigator !== 'undefined' ? !!navigator.onLine : true,
      autoRetryWhenOnline: false,
    }
    this._waitTimer = null
    this._tickTimer = null
    this._maxAttempts = 4
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('RouteChunkBoundary caught an error', error, info)
  }

  componentDidMount() {
    window.addEventListener('online', this._onOnline)
    window.addEventListener('offline', this._onOffline)
  }

  componentWillUnmount() {
    window.clearTimeout(this._waitTimer)
    window.clearInterval(this._tickTimer)
    window.removeEventListener('online', this._onOnline)
    window.removeEventListener('offline', this._onOffline)
  }

  _computeDelay = () => {
    const base = 500 // ms
    const n = Math.min(this.state.attempt, this._maxAttempts - 1)
    return base * Math.pow(2, n) // 500, 1000, 2000, 4000
  }

  _onOnline = () => {
    this.setState({ isOnline: true })
    if (this.state.autoRetryWhenOnline && !this.state.waiting && this.state.attempt < this._maxAttempts) {
      this.props.announce?.('Back online. Retrying…', { toast: { duration: 900 } })
      this.handleRetry()
    } else {
      this.props.announce?.('Back online', { toast: { duration: 900 } })
    }
  }

  _onOffline = () => {
    this.setState({ isOnline: false })
    this.props.announce?.('You went offline', { toast: { duration: 900 } })
  }

  handleRetry = () => {
    if (this.state.waiting) return
    if (this.state.attempt >= this._maxAttempts) {
      this.props.announce?.('Maximum retry attempts reached', { toast: { variant: 'error' } })
      return
    }
    const delay = this._computeDelay()
    this.props.announce?.(`Retrying ${this.props.label || 'content'} in ${Math.round(delay/100)/10}s (attempt ${this.state.attempt + 1}/${this._maxAttempts})`, { toast: { duration: 1200 } })
    this.setState({ waiting: true, waitMs: delay })
    window.clearInterval(this._tickTimer)
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduceMotion) {
      this._tickTimer = window.setInterval(() => {
        this.setState((s) => ({ waitMs: Math.max(0, s.waitMs - 200) }))
      }, 200)
    }
    window.clearTimeout(this._waitTimer)
    this._waitTimer = window.setTimeout(() => {
      window.clearInterval(this._tickTimer)
      this.setState((s) => ({
        waiting: false,
        hasError: false,
        error: null,
        attempt: s.attempt + 1,
        waitMs: 0,
      }))
      try { this.props.onRetry?.() } catch (_) {}
    }, delay)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleCopy = async () => {
    try {
      const lines = []
      const label = this.props.label || 'content'
      const err = this.state.error
      lines.push(`[YourCase] Route load error`)
      lines.push(`Route: ${label}`)
      lines.push(`Time: ${new Date().toISOString()}`)
      if (err?.message) lines.push(`Message: ${String(err.message)}`)
      if (err?.name) lines.push(`Name: ${String(err.name)}`)
      if (err?.stack) lines.push('Stack:\n' + String(err.stack).split('\n').slice(0, 6).join('\n'))
      const text = lines.join('\n')
      await navigator.clipboard.writeText(text)
      this.props.announce?.('Error details copied', { toast: { variant: 'success', duration: 900 } })
    } catch (_) {
      this.props.announce?.('Failed to copy error details', { toast: { variant: 'error' } })
    }
  }

  buildMailto = () => {
    try {
      const label = this.props.label || 'content'
      const err = this.state.error
      const subject = `[YourCase] Route load error: ${label}`
      const lines = []
      lines.push(`[YourCase] Route load error`)
      lines.push(`Route: ${label}`)
      lines.push(`URL: ${typeof window !== 'undefined' ? window.location.href : ''}`)
      lines.push(`Time: ${new Date().toISOString()}`)
      if (err?.message) lines.push(`Message: ${String(err.message)}`)
      if (err?.name) lines.push(`Name: ${String(err.name)}`)
      if (err?.stack) lines.push('Stack:\n' + String(err.stack).split('\n').slice(0, 12).join('\n'))
      lines.push('\nPlease describe what you were doing when this occurred:')
      const body = encodeURIComponent(lines.join('\n'))
      const subj = encodeURIComponent(subject)
      return `mailto:support@yourcase.in?subject=${subj}&body=${body}`
    } catch (_) {
      return 'mailto:support@yourcase.in?subject=Route%20load%20error'
    }
  }

  toggleDetails = () => {
    const next = !this.state.showDetails
    this.setState({ showDetails: next })
    this.props.announce?.(next ? 'Showing technical details' : 'Hiding technical details', { toast: { duration: 800 } })
  }

  buildTechDetails = () => {
    try {
      const lines = []
      const err = this.state.error
      const now = new Date().toISOString()
      const href = typeof window !== 'undefined' ? window.location.href : ''
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
      const platform = typeof navigator !== 'undefined' ? navigator.platform : ''
      const lang = typeof navigator !== 'undefined' ? navigator.language : ''
      const tz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone } catch { return '' } })()
      const size = typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight} @${window.devicePixelRatio || 1}x` : ''

      lines.push(`# Technical details`)
      lines.push(`Time: ${now}`)
      lines.push(`URL: ${href}`)
      lines.push(`User agent: ${ua}`)
      lines.push(`Platform: ${platform}`)
      lines.push(`Language: ${lang}`)
      lines.push(`Timezone: ${tz}`)
      lines.push(`Viewport: ${size}`)
      if (err?.name) lines.push(`\nError name: ${String(err.name)}`)
      if (err?.message) lines.push(`Message: ${String(err.message)}`)
      if (err?.stack) {
        lines.push(`\nStack trace:`)
        lines.push(String(err.stack))
      }
      return lines.join('\n')
    } catch (_) {
      return 'Unable to collect technical details.'
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="p-6"
          tabIndex={0}
          role="group"
          aria-label={`Load error for ${this.props.label || 'content'}. Press R to retry.`}
          onKeyDown={(e) => {
            if (e.key && e.key.toLowerCase() === 'r') {
              e.preventDefault()
              this.handleRetry()
            }
          }}
        >
          <div className="max-w-xl mx-auto rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <Alert variant="error" title={`Could not load ${this.props.label || 'content'}`} message={this.state.error?.message || 'A network or chunk load error occurred.'} />
            {!this.state.isOnline && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-400/40 dark:bg-amber-900/20 dark:text-amber-200" role="status" aria-live="polite">
                You appear to be offline. Reconnect and retry, or enable auto‑retry.
              </div>
            )}
            <div className="mt-4 flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={this.handleRetry}
                aria-label="Retry loading"
                disabled={this.state.waiting || this.state.attempt >= this._maxAttempts}
                disabledTooltip={this.state.attempt >= this._maxAttempts ? 'No more retries' : this.state.waiting ? 'Please wait…' : undefined}
              >
                {this.state.waiting
                  ? `Retrying in ${(this.state.waitMs/1000).toFixed(1)}s…`
                  : `Retry (${Math.min(this.state.attempt + 1, this._maxAttempts)}/${this._maxAttempts})`}
              </Button>
              <Button variant="ghost" size="sm" onClick={this.handleReload} aria-label="Reload application">
                Full reload
              </Button>
              <Button variant="ghost" size="sm" onClick={this.handleCopy} aria-label="Copy error details">
                Copy details
              </Button>
              <Button
                as="a"
                href={this.buildMailto()}
                target="_blank"
                rel="noopener noreferrer"
                variant="ghost"
                size="sm"
                aria-label="Report issue via email"
                onClick={() => this.props.announce?.('Preparing email with details…', { toast: { duration: 900 } })}
              >
                Report issue
              </Button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-3">
              <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={this.state.autoRetryWhenOnline}
                  onChange={(e) => {
                    const v = !!e.target.checked
                    this.setState({ autoRetryWhenOnline: v })
                    this.props.announce?.(v ? 'Auto‑retry when online enabled' : 'Auto‑retry when online disabled', { toast: { duration: 900 } })
                  }}
                  className="h-3 w-3 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-400"
                  aria-label="Auto retry when back online"
                />
                Retry automatically when back online
              </label>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={this.toggleDetails}
                aria-expanded={this.state.showDetails ? 'true' : 'false'}
                aria-controls="route-tech-details"
              >
                {this.state.showDetails ? 'Hide technical details' : 'Show technical details'}
              </Button>
              {this.state.showDetails && (
                <div
                  id="route-tech-details"
                  role="region"
                  aria-label="Technical details"
                  className="mt-3 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-700 dark:text-slate-300"
                >
                  <pre className="whitespace-pre-wrap break-words">{this.buildTechDetails()}</pre>
                </div>
              )}
            </div>
            <p className="mt-3 text-center text-xs text-slate-500" aria-live="polite">
              Tip: Press “R” to retry loading.
            </p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

Boundary.propTypes = {
  children: PropTypes.node,
  label: PropTypes.string,
  onRetry: PropTypes.func,
}

export function RouteChunkBoundary({ label, children }) {
  const { announce } = useLive()
  const { preferences } = useSettingsStore()
  const telemetryOn = !!preferences?.routeRetryTelemetry
  const [key, setKey] = useState(0)

  const onRetry = () => {
    if (telemetryOn) {
      try {
        const raw = sessionStorage.getItem('yc_route_retry_log')
        const arr = raw ? JSON.parse(raw) : []
        arr.push({ ts: Date.now(), label: label || 'content', action: 'retry' })
        sessionStorage.setItem('yc_route_retry_log', JSON.stringify(arr.slice(-100)))
      } catch (_) {}
    }
    announce(`Retrying ${label || 'content'}…`, { toast: { duration: 900 } })
    setKey((k) => k + 1)
  }

  const announcePatched = (msg, opts) => {
    if (telemetryOn && msg) {
      try {
        const raw = sessionStorage.getItem('yc_route_retry_log')
        const arr = raw ? JSON.parse(raw) : []
        arr.push({ ts: Date.now(), label: label || 'content', action: 'announce', msg })
        sessionStorage.setItem('yc_route_retry_log', JSON.stringify(arr.slice(-100)))
      } catch (_) {}
    }
    return announce?.(msg, opts)
  }

  return (
    <Boundary label={label} onRetry={onRetry} announce={announcePatched}>
      <Suspense fallback={<Loader label={`Loading ${label || 'content'}…`} />}>
        <div key={key}>{children}</div>
      </Suspense>
    </Boundary>
  )
}

RouteChunkBoundary.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node,
}

export default RouteChunkBoundary

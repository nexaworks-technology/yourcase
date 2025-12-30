import { createContext, useContext, useRef, useEffect, useState } from 'react'
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import PropTypes from 'prop-types'

const LiveContext = createContext(null)

export function LiveProvider({ children, toastPosition = 'bottom-right', toastDuration = 1500, toastMax = 3 }) {
  const regionRef = useRef(null)
  const queueRef = useRef([])
  const timerRef = useRef(null)
  const [toasts, setToasts] = useState([])
  const toastTimersRef = useRef({})
  const toastClosingTimersRef = useRef({})

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  // announce(message, { polite?: boolean, toast?: false | { duration?: number, position?: string, variant?: 'info'|'success'|'error', onClick?: fn } })
  const announce = (message, { polite = true, toast: showToast = true } = {}) => {
    if (!regionRef.current) return
    // Respect Do Not Disturb preference if available
    try {
      const st = JSON.parse(localStorage.getItem('yc_settings_store') || '{}')
      const dnd = st?.state?.preferences?.doNotDisturb
      if (dnd && showToast) showToast = false
    } catch (_) {}
    queueRef.current.push({ message, polite })
    if (!timerRef.current) flush()
    if (showToast) addToast(message, typeof showToast === 'object' ? showToast : undefined)
  }

  const flush = () => {
    const next = queueRef.current.shift()
    if (!next) return
    const el = regionRef.current
    el.setAttribute('aria-live', next.polite ? 'polite' : 'assertive')
    el.textContent = next.message
    timerRef.current = setTimeout(() => {
      el.textContent = ''
      timerRef.current = null
      if (queueRef.current.length) flush()
    }, 900)
  }

  const dismissToast = (id) => {
    if (toastTimersRef.current[id]) {
      clearTimeout(toastTimersRef.current[id])
      delete toastTimersRef.current[id]
    }
    // trigger exit animation first
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, closing: true } : t)))
    if (toastClosingTimersRef.current[id]) clearTimeout(toastClosingTimersRef.current[id])
    toastClosingTimersRef.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
      delete toastClosingTimersRef.current[id]
    }, 180)
  }

  const addToast = (message, opts) => {
    const id = Date.now() + Math.random()
    const duration = Math.max(600, Number(opts?.duration || toastDuration))
    const position = opts?.position || toastPosition
    const variant = opts?.variant || 'info'
    const onClick = typeof opts?.onClick === 'function' ? opts.onClick : null
    try {
      const recent = JSON.parse(sessionStorage.getItem('yc_toasts_recent') || '[]')
      recent.push({ t: Date.now(), m: message })
      if (recent.length > 10) recent.shift()
      sessionStorage.setItem('yc_toasts_recent', JSON.stringify(recent))
    } catch (_) {}
    setToasts((prev) => {
      const next = [...prev, { id, message, position, variant, onClick, closing: false }]
      // keep stack subtle and bounded
      if (next.length > toastMax) {
        const removed = next.shift()
        if (removed && toastTimersRef.current[removed.id]) {
          clearTimeout(toastTimersRef.current[removed.id])
          delete toastTimersRef.current[removed.id]
        }
      }
      return next
    })
    toastTimersRef.current[id] = setTimeout(() => dismissToast(id), duration)
  }

  return (
    <LiveContext.Provider value={{ announce }}>
      {children}
      {toasts.length > 0 && (
        Object.entries(
          toasts.reduce((acc, t) => {
            (acc[t.position] ||= []).push(t)
            return acc
          }, {})
        ).map(([pos, list]) => {
          const posClass = {
            'bottom-right': 'fixed bottom-5 right-5 items-end',
            'bottom-left': 'fixed bottom-5 left-5 items-start',
            'top-right': 'fixed top-5 right-5 items-end',
            'top-left': 'fixed top-5 left-5 items-start',
          }[pos] || 'fixed bottom-5 right-5 items-end'
          return (
            <div key={pos} className={`z-[260] ${posClass} flex flex-col gap-2`}>
              {list.map((t) => (
                <div
                  key={t.id}
                  role="status"
                  aria-live="polite"
                  className={`yc-toast group rounded-xl border px-3 py-2 text-sm shadow-lg backdrop-blur-sm hover:shadow-xl transition ${t.closing ? 'data-exit' : 'data-enter'} ${
                    t.variant === 'success'
                      ? 'border-emerald-200 dark:border-emerald-700 bg-emerald-50/90 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100'
                      : t.variant === 'error'
                      ? 'border-rose-200 dark:border-rose-700 bg-rose-50/90 dark:bg-rose-900/60 text-rose-900 dark:text-rose-100'
                      : 'border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200'
                  }`}
                  onMouseEnter={() => {
                    if (toastTimersRef.current[t.id]) {
                      clearTimeout(toastTimersRef.current[t.id])
                      delete toastTimersRef.current[t.id]
                    }
                  }}
                  onMouseLeave={() => {
                    if (!toastTimersRef.current[t.id]) {
                      toastTimersRef.current[t.id] = setTimeout(() => dismissToast(t.id), 800)
                    }
                  }}
                  onClick={() => {
                    if (t.onClick) t.onClick()
                  }}
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center" aria-hidden="true">
                      {t.variant === 'success' ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : t.variant === 'error' ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <Info className="h-4 w-4" />
                      )}
                    </span>
                    <span className="flex-1">{t.message}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); dismissToast(t.id) }}
                      className="ml-2 hidden rounded-md border bg-transparent px-1.5 py-0.5 text-xs opacity-70 transition group-hover:inline-flex hover:opacity-100"
                      aria-label="Dismiss"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        })
      )}
      <div id="yc-live" ref={regionRef} className="sr-only" role="status" aria-live="polite" />
    </LiveContext.Provider>
  )
}

export function useLive() {
  return useContext(LiveContext) || { announce: () => {} }
}

LiveProvider.propTypes = {
  children: PropTypes.node,
  toastPosition: PropTypes.oneOf(['bottom-right', 'bottom-left', 'top-right', 'top-left']),
  toastDuration: PropTypes.number,
  toastMax: PropTypes.number,
}

export default { LiveProvider, useLive }

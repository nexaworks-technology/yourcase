import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { createPortal } from 'react-dom'
import { cn } from '../../utils/cn'

const positions = {
  top: 'bottom-full left-1/2 -translate-x-1/2 -translate-y-2 origin-bottom',
  bottom: 'top-full left-1/2 -translate-x-1/2 translate-y-2 origin-top',
  left: 'right-full top-1/2 -translate-y-1/2 -translate-x-2 origin-right',
  right: 'left-full top-1/2 -translate-y-1/2 translate-x-2 origin-left',
}

export function Tooltip({ content, children, position = 'top', className, delay = 100 }) {
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (!triggerRef.current) return
      const rect = triggerRef.current.getBoundingClientRect()
      setCoords({ top: rect.top + window.scrollY, left: rect.left + window.scrollX })
      setVisible(true)
    }, delay)
  }

  const hideTooltip = () => {
    clearTimeout(timeoutRef.current)
    setVisible(false)
  }

  const tooltip = visible ? (
    <div
      role="tooltip"
      className={cn(
        'pointer-events-none absolute z-[120] rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg animate-[fade-in_0.15s_ease-out_forwards] backdrop-blur',
        positions[position],
        className,
      )}
      style={{ top: coords.top, left: coords.left }}
    >
      {content}
      <span
        className={cn(
          'absolute h-2 w-2 rotate-45 rounded-sm bg-slate-900',
          position === 'top' && 'left-1/2 top-full -translate-x-1/2 border-l border-t border-slate-100 dark:border-slate-800',
          position === 'bottom' && 'left-1/2 bottom-full -translate-x-1/2 border-r border-b border-slate-100 dark:border-slate-800',
          position === 'left' && 'top-1/2 left-full -translate-y-1/2 border-t border-r border-slate-100 dark:border-slate-800',
          position === 'right' && 'top-1/2 right-full -translate-y-1/2 border-b border-l border-slate-100 dark:border-slate-800',
        )}
      />
    </div>
  ) : null

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onFocus={showTooltip}
        onMouseLeave={hideTooltip}
        onBlur={hideTooltip}
        className="inline-flex"
      >
        {children}
      </span>
      {visible && createPortal(tooltip, document.body)}
    </>
  )
}

Tooltip.propTypes = {
  content: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  className: PropTypes.string,
  delay: PropTypes.number,
}

/*
Example usage:
<Tooltip content="Copy to clipboard" position="top">
  <Button variant="ghost" icon={Copy}>Copy</Button>
</Tooltip>
*/

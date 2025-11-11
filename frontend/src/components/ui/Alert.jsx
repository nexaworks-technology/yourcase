import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

const variantMap = {
  info: {
    icon: Info,
    border: 'border-l-4 border-blue-500',
    background: 'bg-blue-50',
    text: 'text-blue-700',
  },
  success: {
    icon: CheckCircle2,
    border: 'border-l-4 border-emerald-500',
    background: 'bg-emerald-50',
    text: 'text-emerald-700',
  },
  warning: {
    icon: AlertCircle,
    border: 'border-l-4 border-amber-500',
    background: 'bg-amber-50',
    text: 'text-amber-700',
  },
  error: {
    icon: XCircle,
    border: 'border-l-4 border-rose-500',
    background: 'bg-rose-50',
    text: 'text-rose-700',
  },
}

export function Alert({ variant = 'info', title, message, icon, dismissible, onClose, className, actions }) {
  const [visible, setVisible] = useState(true)
  const { icon: VariantIcon, border, background, text } = variantMap[variant] || variantMap.info

  useEffect(() => {
    setVisible(true)
  }, [variant, title, message])

  if (!visible) return null

  const handleClose = () => {
    setVisible(false)
    onClose?.()
  }

  return (
    <div
      className={cn(
        'relative flex w-full items-start gap-3 rounded-2xl px-4 py-3 shadow-sm transition-all animate-[slide-up_0.25s_ease-out]',
        border,
        background,
        text,
        className,
      )}
    >
      <span className="mt-1" aria-hidden="true">
        {icon ? icon : <VariantIcon className="h-5 w-5" />}
      </span>
      <div className="flex-1">
        {title && <h3 className="text-sm font-semibold">{title}</h3>}
        {message && <p className="text-sm opacity-90">{message}</p>}
        {actions && <div className="mt-3 flex flex-wrap gap-2 text-sm">{actions}</div>}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={handleClose}
          className="rounded-full p-1 text-inherit/60 transition hover:text-inherit"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

Alert.propTypes = {
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  title: PropTypes.node,
  message: PropTypes.node,
  icon: PropTypes.element,
  dismissible: PropTypes.bool,
  onClose: PropTypes.func,
  className: PropTypes.string,
  actions: PropTypes.node,
}

/*
Example usage:
<Alert
  variant="success"
  title="Document analyzed"
  message="Your case brief is ready with insights and recommendations."
  dismissible
/>
*/

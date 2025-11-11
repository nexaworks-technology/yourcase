import PropTypes from 'prop-types'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

const variantStyles = {
  default: 'bg-slate-100 text-slate-700',
  primary: 'bg-blue-100 text-blue-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-rose-100 text-rose-700',
  info: 'bg-sky-100 text-sky-700',
}

const sizeStyles = {
  sm: 'text-xs px-2 py-1',
  md: 'text-xs px-3 py-1.5',
  lg: 'text-sm px-3.5 py-2',
}

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  dot,
  removable,
  onRemove,
  className,
  number,
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full font-medium transition-colors',
        variantStyles[variant] || variantStyles.default,
        sizeStyles[size],
        className,
      )}
    >
      {dot && <span className="h-2.5 w-2.5 rounded-full bg-current" aria-hidden="true" />}
      <span>{children}</span>
      {number !== undefined && (
        <span className="inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full bg-black/10 px-2 text-[0.65rem] font-semibold">
          {number}
        </span>
      )}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-1 text-inherit/60 transition hover:text-inherit"
          aria-label="Remove badge"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  )
}

Badge.propTypes = {
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'error', 'info']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  children: PropTypes.node,
  dot: PropTypes.bool,
  removable: PropTypes.bool,
  onRemove: PropTypes.func,
  className: PropTypes.string,
  number: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
}

/*
Example usage:
<Badge variant="primary" dot number={3}>Active cases</Badge>
*/

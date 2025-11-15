import PropTypes from 'prop-types'
import { cn } from '../../utils/cn'

const variantStyles = {
  default: 'bg-white dark:bg-slate-900 shadow-sm',
  bordered: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm',
  elevated: 'bg-white dark:bg-slate-900 shadow-lg',
  gradient: 'bg-gradient-to-br from-blue-50 via-white to-slate-50 shadow-lg',
  glass: 'bg-white dark:bg-slate-900/70 backdrop-blur shadow-lg border border-white/40',
}

const paddingMap = {
  sm: 'p-4 md:p-5',
  md: 'p-6 md:p-8',
  lg: 'p-8 md:p-10',
}

export function Card({
  variant = 'default',
  padding = 'md',
  hover = false,
  border = false,
  shadow = true,
  className,
  children,
  header,
  footer,
  loading = false,
  onClick,
  ...props
}) {
  const baseClass = cn(
    'group relative flex flex-col gap-4 rounded-3xl transition-all duration-300 ease-out',
    variantStyles[variant] || variantStyles.default,
    paddingMap[padding],
    border && 'border border-slate-200 dark:border-slate-700/70',
    shadow === false && 'shadow-none',
    hover && 'hover:-translate-y-1 hover:shadow-xl',
    onClick && 'cursor-pointer overflow-hidden',
    className,
  )

  return (
    <div className={baseClass} onClick={onClick} {...props}>
      {loading && (
        <div className="absolute inset-0 z-10 rounded-3xl bg-white dark:bg-slate-900/70 backdrop-blur-sm" aria-hidden="true">
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-500" />
          </div>
        </div>
      )}

      {header && <div className="flex items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">{header}</div>}
      <div className="flex-1">{children}</div>
      {footer && <div className="pt-2 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">{footer}</div>}
    </div>
  )
}

Card.propTypes = {
  variant: PropTypes.oneOf(['default', 'bordered', 'elevated', 'gradient', 'glass']),
  padding: PropTypes.oneOf(['sm', 'md', 'lg']),
  hover: PropTypes.bool,
  border: PropTypes.bool,
  shadow: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  className: PropTypes.string,
  children: PropTypes.node,
  header: PropTypes.node,
  footer: PropTypes.node,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
}

/*
Example usage:
<Card
  variant="gradient"
  hover
  header={<div className="font-semibold text-slate-700 dark:text-slate-300">Case Overview</div>}
  footer={<button className="text-sm text-blue-600">View details</button>}
>
  <p className="text-slate-600 dark:text-slate-300">
    Your AI assistant analyzed the latest filings and prepared a briefing for tomorrow's hearing.
  </p>
</Card>
*/

import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import PropTypes from 'prop-types'
import { cn } from '../../utils/cn'

const variants = {
  primary:
    'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:from-blue-600 hover:to-blue-600 hover:shadow-xl active:scale-[0.98] focus-visible:ring-blue-300',
  secondary:
    'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm hover:bg-slate-200 dark:bg-slate-700 hover:text-slate-900 dark:text-slate-100 focus-visible:ring-slate-200',
  outline:
    'border border-blue-600 text-blue-600 hover:bg-blue-50 focus-visible:ring-blue-200',
  ghost:
    'text-blue-600 hover:bg-blue-50 focus-visible:ring-blue-100',
  danger:
    'bg-rose-500 text-white hover:bg-rose-600 focus-visible:ring-rose-200',
  success:
    'bg-emerald-500 text-white hover:bg-emerald-600 focus-visible:ring-emerald-200',
}

const sizes = {
  sm: 'h-9 min-w-[7rem] px-3 text-sm',
  md: 'h-11 min-w-[8.5rem] px-4 text-sm',
  lg: 'h-12 min-w-[10rem] px-5 text-base',
  xl: 'h-14 min-w-[12rem] px-6 text-base',
}

export const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      className,
      loading = false,
      disabled = false,
      icon: Icon,
      iconPosition = 'left',
      onClick,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    const handleClick = (event) => {
      if (isDisabled) {
        event.preventDefault()
        return
      }
      onClick?.(event)
    }

    return (
      <button
        ref={ref}
        type={type}
        onClick={handleClick}
        aria-busy={loading}
        aria-disabled={isDisabled}
        disabled={isDisabled}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        <span className="pointer-events-none absolute inset-0 bg-white dark:bg-slate-900/20 opacity-0 transition-opacity duration-200" aria-hidden="true" />
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <>
            {Icon && iconPosition === 'left' && <Icon className="h-4 w-4" aria-hidden="true" />}
            <span>{children}</span>
            {Icon && iconPosition === 'right' && <Icon className="h-4 w-4" aria-hidden="true" />}
          </>
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger', 'success']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.elementType,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  children: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.string,
}

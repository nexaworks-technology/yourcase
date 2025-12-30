import PropTypes from 'prop-types'
import { forwardRef, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

const base =
  'relative inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium transition yc-ink focus-visible:yc-focus yc-focus-anim disabled:opacity-60 disabled:pointer-events-none'

const sizes = {
  sm: 'text-xs px-3 py-2 gap-2',
  md: 'text-sm px-4 py-2.5 gap-2.5',
  lg: 'text-sm px-5 py-3 gap-3',
}

const variants = {
  primary: 'bg-accent text-white hover:opacity-90',
  secondary:
    'bg-gray-900 text-white hover:opacity-90 dark:bg-gray-100 dark:text-gray-900',
  outline:
    'border border-accent text-accent hover:bg-accent/10 dark:hover:bg-accent/15',
  ghost:
    'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
  link: 'yc-accent-link px-0 py-0',
}

export const Button = forwardRef(function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  loading = false,
  to,
  as = 'button',
  iconOnly = false,
  disabledTooltip,
  ...rest
}, ref) {
  // Warn in dev when iconOnly is used without an aria-label
  if (iconOnly && process.env.NODE_ENV !== 'production') {
    const hasAria = rest['aria-label'] || rest['ariaLabel']
    if (!hasAria) {
      // eslint-disable-next-line no-console
      console.warn('Button: iconOnly buttons must include an aria-label for accessibility')
    }
  }

  const content = (
    <>
      {LeftIcon && (
        <LeftIcon className={cn('h-4 w-4', loading ? 'opacity-0' : '')} aria-hidden="true" />
      )}
      {iconOnly ? (
        <span className="sr-only">{typeof children === 'string' ? children : 'Action'}</span>
      ) : (
        <span className={cn(loading ? 'opacity-0' : '')}>{children}</span>
      )}
      {RightIcon && (
        <RightIcon className={cn('h-4 w-4', loading ? 'opacity-0' : '')} aria-hidden="true" />
      )}
      {loading && (
        <span
          className="absolute inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent"
          aria-hidden="true"
        />
      )}
    </>
  )

  const iconOnlySize = {
    sm: 'h-8 w-8 p-2',
    md: 'h-9 w-9 p-2.5',
    lg: 'h-10 w-10 p-2.5',
  }

  const cls = cn(
    base,
    iconOnly ? iconOnlySize[size] : sizes[size],
    variants[variant],
    className,
  )

  const isDisabled = Boolean(rest.disabled) || Boolean(loading)
  const tipRef = useRef(null)
  const [showTip, setShowTip] = useState(false)
  const showTimerRef = useRef(null)
  const hideTimerRef = useRef(null)

  const startHover = () => {
    window.clearTimeout(hideTimerRef.current)
    window.clearTimeout(showTimerRef.current)
    showTimerRef.current = window.setTimeout(() => setShowTip(true), 220)
  }
  const endHover = () => {
    window.clearTimeout(showTimerRef.current)
    window.clearTimeout(hideTimerRef.current)
    hideTimerRef.current = window.setTimeout(() => setShowTip(false), 50)
  }

  const wrapperProps = disabledTooltip && isDisabled
    ? {
        onMouseEnter: startHover,
        onMouseLeave: endHover,
      }
    : {}

  if (to) {
    if (isDisabled) {
      // Render a non-interactive element to mimic disabled link button
      return (
        <span className="relative inline-block" {...wrapperProps}>
          <span className={cls} aria-disabled="true">
            {content}
          </span>
          {disabledTooltip && (
            <span
              ref={tipRef}
              className="yc-tooltip left-1/2"
              style={{ top: '110%' }}
              data-show={showTip ? 'true' : 'false'}
              role="status"
              aria-live="polite"
            >
              {disabledTooltip}
            </span>
          )}
        </span>
      )
    }
    return (
      <Link to={to} className={cls} ref={ref} {...rest}>
        {content}
      </Link>
    )
  }

  const Comp = as
  const buttonEl = (
    <Comp
      className={cls}
      ref={ref}
      onFocus={(e) => {
        if (disabledTooltip && isDisabled) {
          window.clearTimeout(showTimerRef.current)
          window.clearTimeout(hideTimerRef.current)
          setShowTip(true)
        }
        rest.onFocus?.(e)
      }}
      onBlur={(e) => {
        if (disabledTooltip && isDisabled) {
          window.clearTimeout(showTimerRef.current)
          window.clearTimeout(hideTimerRef.current)
          setShowTip(false)
        }
        rest.onBlur?.(e)
      }}
      {...rest}
    >
      {content}
    </Comp>
  )

  if (disabledTooltip && isDisabled) {
    return (
      <span className="relative inline-block" {...wrapperProps}>
        {buttonEl}
        <span
          ref={tipRef}
          className="yc-tooltip left-1/2"
          style={{ top: '110%' }}
          data-show={showTip ? 'true' : 'false'}
          role="status"
          aria-live="polite"
        >
          {disabledTooltip}
        </span>
      </span>
    )
  }

  return buttonEl
})

Button.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'link']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  leftIcon: PropTypes.elementType,
  rightIcon: PropTypes.elementType,
  loading: PropTypes.bool,
  to: PropTypes.string,
  as: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]),
  iconOnly: PropTypes.bool,
  disabledTooltip: PropTypes.string,
}

export default Button

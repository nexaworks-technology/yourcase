import PropTypes from 'prop-types'
import { cn } from '../../utils/cn'

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

function CircleSpinner({ size, color }) {
  return (
    <span
      className={cn('inline-block animate-spin rounded-full border-2 border-current border-t-transparent', sizeMap[size])}
      style={{ color }}
      aria-hidden="true"
    />
  )
}

function DotsSpinner({ size, color }) {
  const scale = size === 'xl' ? '2' : size === 'lg' ? '1.5' : size === 'md' ? '1.25' : '1'
  return (
    <span className="flex items-center gap-1" aria-hidden="true" style={{ color }}>
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="h-2 w-2 animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-current"
          style={{ animationDelay: `${dot * 0.15}s`, transform: `scale(${scale})` }}
        />
      ))}
    </span>
  )
}

function PulseSpinner({ size, color }) {
  return (
    <span
      className={cn('inline-flex h-10 w-10 items-center justify-center rounded-full bg-current/10', size === 'sm' && 'h-6 w-6', size === 'md' && 'h-8 w-8')}
    >
      <span
        className="inline-block h-1/2 w-1/2 rounded-full bg-current animate-[pulse_1.5s_ease-in-out_infinite]"
        style={{ color }}
        aria-hidden="true"
      />
    </span>
  )
}

function BarsSpinner({ color }) {
  return (
    <span className="flex items-end gap-1" aria-hidden="true" style={{ color }}>
      {[0, 1, 2].map((bar) => (
        <span
          key={bar}
          className="h-4 w-1 rounded-full bg-current animate-[wave_1s_ease-in-out_infinite]"
          style={{ animationDelay: `${bar * 0.12}s` }}
        />
      ))}
    </span>
  )
}

export function Spinner({ size = 'md', color = 'currentColor', variant = 'circle', className, center }) {
  const wrapperClass = cn(center && 'flex items-center justify-center')
  let Component = CircleSpinner
  if (variant === 'dots') Component = DotsSpinner
  else if (variant === 'pulse') Component = PulseSpinner
  else if (variant === 'bars') Component = BarsSpinner

  return (
    <span className={cn('inline-flex', className, wrapperClass)} role="status" aria-live="polite">
      <Component size={size} color={color} />
      <span className="sr-only">Loading...</span>
    </span>
  )
}

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  color: PropTypes.string,
  variant: PropTypes.oneOf(['circle', 'dots', 'pulse', 'bars']),
  className: PropTypes.string,
  center: PropTypes.bool,
}

/*
Example usage:
<Spinner variant="dots" color="var(--color-text)" />
*/

import PropTypes from 'prop-types'
import { cn } from '../../utils/cn'

const colorMap = {
  primary: 'from-blue-500 to-blue-600',
  success: 'from-emerald-400 to-emerald-600',
  warning: 'from-amber-400 to-amber-600',
  error: 'from-rose-500 to-rose-600',
  info: 'from-sky-400 to-sky-600',
}

export function Progress({ value = 0, color = 'primary', showLabel = true, className }) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Progress</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/60">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-300', colorMap[color])}
          style={{ width: `${clamped}%` }}
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
    </div>
  )
}

Progress.propTypes = {
  value: PropTypes.number,
  color: PropTypes.oneOf(['primary', 'success', 'warning', 'error', 'info']),
  showLabel: PropTypes.bool,
  className: PropTypes.string,
}

export function CircularProgress({ value = 0, size = 80, strokeWidth = 8, color = 'primary', showLabel = true }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference

  const strokeColor = {
    primary: '#2563eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#f43f5e',
    info: '#0ea5e9',
  }[color]

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        <circle
          className="text-slate-200"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <span className="absolute text-sm font-semibold text-slate-700">{Math.round(value)}%</span>
      )}
    </div>
  )
}

CircularProgress.propTypes = {
  value: PropTypes.number,
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
  color: PropTypes.oneOf(['primary', 'success', 'warning', 'error', 'info']),
  showLabel: PropTypes.bool,
}

/*
Example usage:
<Progress value={72} />
<CircularProgress value={45} color="success" />
*/

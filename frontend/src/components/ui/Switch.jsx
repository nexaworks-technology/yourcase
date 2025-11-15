import PropTypes from 'prop-types'
import { cn } from '../../utils/cn'

export function Switch({ checked, onCheckedChange, className, size = 'md' }) {
  const handleToggle = () => {
    onCheckedChange?.(!checked)
  }

  const dimensions = {
    sm: 'h-5 w-9',
    md: 'h-6 w-11',
    lg: 'h-7 w-14',
  }

  const thumbSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const translate = {
    sm: checked ? 'translate-x-4' : 'translate-x-1',
    md: checked ? 'translate-x-5' : 'translate-x-1',
    lg: checked ? 'translate-x-7' : 'translate-x-1',
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={handleToggle}
      className={cn(
        'relative inline-flex items-center rounded-full border border-transparent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700',
        dimensions[size],
        className,
      )}
    >
      <span
        className={cn(
          'pointer-events-none block transform rounded-full bg-white dark:bg-slate-900 shadow ring-0 transition',
          thumbSizes[size],
          translate[size],
        )}
      />
    </button>
  )
}

Switch.propTypes = {
  checked: PropTypes.bool,
  onCheckedChange: PropTypes.func,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
}

Switch.defaultProps = {
  checked: false,
  onCheckedChange: undefined,
  className: undefined,
  size: 'md',
}

export default Switch

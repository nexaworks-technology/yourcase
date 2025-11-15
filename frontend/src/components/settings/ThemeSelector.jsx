import PropTypes from 'prop-types'
import { Sun, Moon, Laptop } from 'lucide-react'
import { cn } from '../../utils/cn'

const themes = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Laptop },
]

export function ThemeSelector({ value, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {themes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange?.(id)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-2xl border px-4 py-6 text-sm transition',
              value === id
                ? 'border-blue-300 bg-blue-50 text-blue-700 shadow-md dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
            )}
          >
            <Icon className="h-6 w-6" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

ThemeSelector.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default ThemeSelector

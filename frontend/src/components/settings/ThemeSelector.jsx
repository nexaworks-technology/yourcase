import PropTypes from 'prop-types'
import { useState } from 'react'
import { Palette, Sun, Moon, Laptop } from 'lucide-react'
import { cn } from '../../utils/cn'

const themes = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Laptop },
]

export function ThemeSelector({ value, onChange, accentColor, onAccentChange }) {
  const [color, setColor] = useState(accentColor || '#4F46E5')

  const handleColorChange = (event) => {
    setColor(event.target.value)
    onAccentChange?.(event.target.value)
  }

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
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 dark:text-slate-300">
          <Palette className="h-4 w-4" />
          Accent colour
          <input
            type="color"
            value={color}
            onChange={handleColorChange}
            className="ml-auto h-10 w-16 cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-600"
          />
        </label>
      </div>
    </div>
  )
}

ThemeSelector.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  accentColor: PropTypes.string,
  onAccentChange: PropTypes.func,
}

ThemeSelector.defaultProps = {
  accentColor: '#4F46E5',
  onAccentChange: undefined,
}

export default ThemeSelector

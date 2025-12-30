import PropTypes from 'prop-types'
import { Sun, Moon, Laptop, Droplet } from 'lucide-react'
import { cn } from '../../utils/cn'

const themes = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Laptop },
]

export function ThemeSelector({ value, onChange }) {
  return (
    <div className="space-y-6">
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
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800',
            )}
          >
            <Icon className="h-6 w-6" />
            {label}
          </button>
        ))}
      </div>

      <AccentPicker />
    </div>
  )
}

ThemeSelector.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default ThemeSelector

function AccentPicker() {
  const presets = ['#4F46E5', '#22C55E', '#EF4444', '#06B6D4', '#F59E0B', '#8B5CF6']
  const { accentColor, setAccentColor } = require('../../context/ThemeContext').useTheme()

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
        <Droplet className="h-4 w-4" /> Accent color
      </div>
      <div className="flex flex-wrap gap-2">
        {presets.map((hex) => (
          <button
            key={hex}
            type="button"
            onClick={() => setAccentColor(hex)}
            className={cn(
              'h-8 w-8 rounded-full ring-2 ring-transparent transition hover:scale-105',
              accentColor?.toLowerCase() === hex.toLowerCase() ? 'ring-blue-500' : 'ring-transparent',
            )}
            style={{ backgroundColor: hex }}
            aria-label={`Set accent color ${hex}`}
            title={hex}
          />
        ))}
        <label className="inline-flex h-8 items-center gap-2 rounded-xl border border-slate-200 px-2 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
          Custom
          <input
            type="color"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            className="h-5 w-10 cursor-pointer bg-transparent p-0"
            aria-label="Choose custom accent color"
          />
        </label>
      </div>
    </div>
  )
}

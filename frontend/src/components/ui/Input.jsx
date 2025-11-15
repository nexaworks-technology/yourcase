import { useId, useState } from 'react'
import PropTypes from 'prop-types'
import { Eye, EyeOff, X } from 'lucide-react'
import { cn } from '../../utils/cn'

export function Input({
  type = 'text',
  label,
  placeholder,
  error,
  helperText,
  icon: Icon,
  disabled,
  required,
  className,
  value,
  onChange,
  maxLength,
  success,
  ...props
}) {
  const inputId = useId()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const isPassword = type === 'password'
  const displayType = isPassword && isPasswordVisible ? 'text' : type
  const showClear = type !== 'password' && Boolean(value)

  const handleTogglePassword = () => setIsPasswordVisible((prev) => !prev)
  const handleClear = () => onChange?.({ target: { value: '' } })

  return (
    <div className={cn('relative w-full', disabled && 'opacity-60', className)}>
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
          {label}
          {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
      )}
      <div
        className={cn(
          'group relative flex h-11 w-full items-center rounded-xl border bg-white dark:bg-slate-900 px-4 shadow-sm transition-all duration-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100',
          error && 'border-rose-500 focus-within:border-rose-500 focus-within:ring-rose-100',
          success && !error && 'border-emerald-500 focus-within:ring-emerald-100',
          disabled && 'pointer-events-none bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500',
        )}
      >
        {Icon && <Icon className="mr-3 h-4 w-4 text-slate-400 dark:text-slate-500" aria-hidden="true" />}

        <input
          id={inputId}
          type={displayType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-8 w-full bg-transparent text-base text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:text-slate-500"
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={helperText ? `${inputId}-helper` : undefined}
          maxLength={maxLength}
          required={required}
          {...props}
        />

        <div className="ml-3 flex items-center gap-2">
          {isPassword && (
            <button
              type="button"
              className="text-slate-400 dark:text-slate-500 transition-colors hover:text-slate-600 dark:hover:text-slate-300 dark:text-slate-300"
              onClick={handleTogglePassword}
              aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            >
              {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          {showClear && (
            <button
              type="button"
              className="text-slate-400 dark:text-slate-500 transition-colors hover:text-slate-600 dark:hover:text-slate-300 dark:text-slate-300"
              onClick={handleClear}
              aria-label="Clear input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {(helperText || error) && (
        <p
          id={`${inputId}-helper`}
          className={cn(
            'mt-2 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 transition-all',
            error && 'text-rose-500 animate-[shake_0.3s_ease-in-out]',
            success && !error && 'text-emerald-500',
          )}
        >
          {error || helperText}
        </p>
      )}

      {maxLength && (
        <p className="mt-1 text-right text-xs text-slate-400 dark:text-slate-500">
          {(value?.length || 0)} / {maxLength}
        </p>
      )}
    </div>
  )
}

Input.propTypes = {
  type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'tel', 'url', 'search']),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  icon: PropTypes.elementType,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  maxLength: PropTypes.number,
  success: PropTypes.bool,
}

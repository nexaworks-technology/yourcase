import { useId, useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

export function Textarea({
  label,
  placeholder,
  error,
  helperText,
  disabled,
  required,
  className,
  value,
  onChange,
  maxLength,
  autoResize = true,
  maxHeight = 240,
  showWordCount = false,
  ...props
}) {
  const textareaId = useId()
  const textareaRef = useRef(null)
  const [internalValue, setInternalValue] = useState(value || '')

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value)
    }
  }, [value])

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
    }
  }, [internalValue, autoResize, maxHeight])

  const handleChange = (event) => {
    setInternalValue(event.target.value)
    onChange?.(event)
  }

  const handleClear = () => {
    const event = { target: { value: '' } }
    setInternalValue('')
    onChange?.(event)
  }

  const length = internalValue?.length || 0
  const wordCount = internalValue ? internalValue.trim().split(/\s+/).filter(Boolean).length : 0

  return (
    <div className={cn('relative w-full', disabled && 'opacity-60', className)}>
      <div
        className={cn(
          'group relative rounded-xl border bg-white px-4 py-3 shadow-sm transition-all duration-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100',
          error && 'border-rose-500 focus-within:border-rose-500 focus-within:ring-rose-100',
          disabled && 'pointer-events-none bg-slate-50 text-slate-400',
        )}
      >
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              'pointer-events-none text-xs font-medium uppercase tracking-wide text-slate-500 transition-all duration-200',
              internalValue ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
            )}
          >
            {label}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={textareaRef}
          value={internalValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full resize-none bg-transparent text-base text-slate-900 outline-none"
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={helperText ? `${textareaId}-helper` : undefined}
          maxLength={maxLength}
          required={required}
          style={{ maxHeight }}
          {...props}
        />

        {internalValue && !disabled && (
          <button
            type="button"
            className="absolute right-3 top-3 text-slate-400 transition-colors hover:text-slate-600"
            onClick={handleClear}
            aria-label="Clear textarea"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {(helperText || error) && (
        <p
          id={`${textareaId}-helper`}
          className={cn(
            'mt-2 text-xs text-slate-500 transition-all',
            error && 'text-rose-500 animate-[shake_0.3s_ease-in-out]',
          )}
        >
          {error || helperText}
        </p>
      )}

      {(maxLength || showWordCount) && (
        <p className="mt-1 text-right text-xs text-slate-400">
          {showWordCount && `${wordCount} word${wordCount === 1 ? '' : 's'}`} {maxLength && `• ${length}/${maxLength}`}
        </p>
      )}
    </div>
  )
}

Textarea.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  maxLength: PropTypes.number,
  autoResize: PropTypes.bool,
  maxHeight: PropTypes.number,
  showWordCount: PropTypes.bool,
}

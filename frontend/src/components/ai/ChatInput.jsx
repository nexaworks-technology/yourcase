import { useEffect, useId, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Paperclip, Mic, Send, Loader2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'

const MAX_LENGTH = 10000

export function ChatInput({ initialValue = '', loading, onSubmit, onAttach }) {
  const textareaRef = useRef(null)
  const [value, setValue] = useState(initialValue)
  const inputId = useId()

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`
    }
  }, [value])

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    if (!value.trim() || loading) return
    onSubmit?.(value)
    setValue('')
  }

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-md">
      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
        <span>Ask anything about law, compliance, or drafts…</span>
        <span>
          {value.length}/{MAX_LENGTH}
        </span>
      </div>
      <textarea
        ref={textareaRef}
        id={inputId}
        value={value}
        onChange={(event) => setValue(event.target.value.slice(0, MAX_LENGTH))}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything about law…"
        className="mt-3 w-full resize-none rounded-2xl bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20"
        rows={1}
      />
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" iconOnly aria-label="Attach document" onClick={onAttach}>
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" iconOnly aria-label="Voice input">
            <Mic className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!value.trim() || loading}
          disabledTooltip={!value.trim() ? 'Type a message to enable' : loading ? 'Sending…' : undefined}
          variant="primary"
          size="md"
          leftIcon={loading ? Loader2 : Send}
          loading={loading}
          aria-label="Send message"
        >
          {loading ? 'Sending…' : 'Send'}
        </Button>
      </div>
    </div>
  )
}

ChatInput.propTypes = {
  initialValue: PropTypes.string,
  loading: PropTypes.bool,
  onSubmit: PropTypes.func,
  onAttach: PropTypes.func,
}

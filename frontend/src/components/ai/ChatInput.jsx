import { useEffect, useId, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Paperclip, Mic, Send, Loader2 } from 'lucide-react'
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
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-md">
      <div className="flex items-center justify-between text-xs text-slate-400">
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
        className="mt-3 w-full resize-none rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        rows={1}
      />
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAttach}
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-slate-700"
            aria-label="Attach document"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-slate-700"
            aria-label="Voice input"
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!value.trim() || loading}
          className={cn(
            'inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300',
          )}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {loading ? 'Sending…' : 'Send'}
        </button>
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

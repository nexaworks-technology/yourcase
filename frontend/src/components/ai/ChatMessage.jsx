import PropTypes from 'prop-types'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'prism-react-renderer'
import { Copy, RefreshCw, User, Sparkles } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from '../ui/Button'

export function ChatMessage({ message, isUser, timestamp, onCopy, onRegenerate }) {
  return (
    <div className={cn('flex w-full gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </span>
      )}

      <div
        className={cn(
          'max-w-2xl space-y-3 rounded-3xl border px-4 py-3 shadow-sm transition-all animate-[fade-in_0.3s_ease-out,slide-up_0.3s_ease-out]',
          isUser
            ? 'border-blue-100 bg-blue-500 text-white'
            : 'border-slate-200 bg-white text-slate-800',
        )}
      >
        <ReactMarkdown
          className="prose prose-sm max-w-none text-inherit"
          components={{
            code({ inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <SyntaxHighlighter language={match[1]} PreTag="div" {...props}>
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={cn('rounded bg-slate-200/60 px-1 py-0.5 text-xs', className)} {...props}>
                  {children}
                </code>
              )
            },
          }}
        >
          {message}
        </ReactMarkdown>

        <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
          <span>{timestamp}</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isUser ? 'ghost' : 'outline'}
              icon={Copy}
              className="h-8 px-3"
              onClick={onCopy}
            >
              Copy
            </Button>
            {!isUser && onRegenerate && (
              <Button size="sm" variant="ghost" icon={RefreshCw} className="h-8 px-3" onClick={onRegenerate}>
                Regenerate
              </Button>
            )}
          </div>
        </div>
      </div>

      {isUser && (
        <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white">
          <User className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
    </div>
  )
}

ChatMessage.propTypes = {
  message: PropTypes.string.isRequired,
  isUser: PropTypes.bool,
  timestamp: PropTypes.string,
  onCopy: PropTypes.func,
  onRegenerate: PropTypes.func,
}

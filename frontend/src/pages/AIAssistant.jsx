import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  Sparkles,
  Paperclip,
  Upload,
  Play,
  Plus,
  Bot,
  ChevronDown,
  Search,
} from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { ChatMessage } from '../components/ai/ChatMessage'
import { ChatInput } from '../components/ai/ChatInput'
import { RecentQueriesWidget } from '../components/dashboard/RecentQueriesWidget'
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { useAIStore } from '../store/aiStore'
import { queryService } from '../services/queryService'

const quickActions = [
  { label: 'New Query', description: 'Ask YourCase assistant', icon: Bot, color: 'bg-blue-500/10 text-blue-600' },
  { label: 'Upload Document', description: 'Analyze new evidence', icon: Upload, color: 'bg-slate-500/10 text-slate-600' },
  { label: 'Create Matter', description: 'Track new engagement', icon: Plus, color: 'bg-emerald-500/10 text-emerald-600' },
  { label: 'Run Workflow', description: 'Automate review', icon: Play, color: 'bg-amber-500/10 text-amber-600' },
]

export default function AIAssistant() {
  const [, setSelectedQuery] = useState(null)
  const {
    messages,
    isLoading,
    sendMessage,
    receiveMessage,
    settings,
    updateSettings,
  } = useAIStore()

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['queries'],
    queryFn: () => queryService.getQueries({ limit: 50 }),
    select: (response) => response.data ?? [],
  })

  const handleSend = async (value) => {
    const message = { id: Date.now().toString(), role: 'user', content: value, timestamp: new Date().toISOString() }
    sendMessage(message)

    try {
      receiveMessage({
        id: `${message.id}-ai`,
        role: 'assistant',
        content: 'This is a mock AI response. Integrate geminiService to fetch real output.',
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Assistant"
        description="Ask legal-grade AI questions with full context awareness."
        actions={<Button icon={Sparkles}>Start new chat</Button>}
      />

      <div className="grid min-h-[70vh] gap-6 xl:grid-cols-[320px_1fr_320px]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <Button size="sm" icon={Sparkles} className="w-full justify-center">New chat</Button>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <label className="flex items-center gap-2 text-xs text-slate-500">
              <Search className="h-4 w-4" />
              <input className="w-full border-none bg-transparent text-sm outline-none" placeholder="Search queries" />
            </label>
          </div>

          <div className="mt-4 space-y-4 overflow-y-auto pr-2">
            {historyLoading ? (
              <div className="space-y-3">
                <Skeleton variant="text" height={18} />
                <Skeleton variant="text" height={18} />
                <Skeleton variant="text" height={18} />
              </div>
            ) : (
              history?.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="w-full rounded-2xl border border-slate-100 px-3 py-2 text-left text-sm text-slate-600 transition hover:border-blue-100 hover:bg-blue-50/60"
                  onClick={() => setSelectedQuery(item)}
                >
                  <p className="font-semibold text-slate-800">
                    {item.prompt?.slice(0, 60)}
                    {item.prompt?.length > 60 ? '…' : ''}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                    <Badge variant="info" size="sm">{item.queryType}</Badge>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Button variant="ghost" icon={ChevronDown} iconPosition="right">
                {settings.queryType ?? 'Select query type'}
              </Button>
              <Button variant="ghost" icon={ChevronDown} iconPosition="right">
                {settings.model ?? 'Select model'}
              </Button>
            </div>
            <Button variant="ghost" onClick={() => useAIStore.getState().clearChat()}>Clear chat</Button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-400">
                <Sparkles className="h-8 w-8" />
                <p>Start a conversation with YourCase AI assistant.</p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.content}
                  isUser={message.role === 'user'}
                  timestamp={new Date(message.timestamp).toLocaleTimeString()}
                  onCopy={() => navigator.clipboard.writeText(message.content)}
                  onRegenerate={message.role === 'assistant' ? () => console.log('regenerate') : undefined}
                />
              ))
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="inline-flex h-2 w-2 animate-[pulse_1.4s_linear_infinite] rounded-full bg-blue-500" />
                YourCase is thinking…
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 px-6 py-4">
            <ChatInput loading={isLoading} onSubmit={handleSend} onAttach={() => console.log('attach document')} />
          </div>
        </section>

        <aside className="hidden h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:block">
          <h2 className="text-lg font-semibold text-slate-800">Context</h2>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Attached documents</h3>
                <Button variant="ghost" size="sm" icon={Paperclip} iconPosition="right">
                  Add
                </Button>
              </div>
              <p className="mt-1 text-xs text-slate-500">Bring files into context for smarter answers.</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700">Model settings</h3>
              <p className="mt-1 text-xs text-slate-500">Adjust precision and creativity.</p>
              <div className="mt-4 space-y-4 text-xs text-slate-500">
                <div>
                  <label className="font-semibold text-slate-600">Temperature ({settings.temperature})</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(event) => updateSettings({ temperature: Number(event.target.value) })}
                    className="mt-1 w-full"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600">Max tokens ({settings.maxTokens})</label>
                  <input
                    type="range"
                    min="512"
                    max="4096"
                    step="128"
                    value={settings.maxTokens}
                    onChange={(event) => updateSettings({ maxTokens: Number(event.target.value) })}
                    className="mt-1 w-full"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700">Quick actions</h3>
              <div className="mt-4 space-y-4">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-left transition hover:border-blue-100 hover:bg-blue-50/60"
                  >
                    <span className={cn('rounded-2xl p-3 shadow-sm', action.color)}>
                      <action.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{action.label}</p>
                      <p className="text-xs text-slate-500">{action.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

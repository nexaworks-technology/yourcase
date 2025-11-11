import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Sparkles,
  Paperclip,
  Upload,
  Play,
  Plus,
  Bot,
  Search,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { ChatMessage } from '../components/ai/ChatMessage'
import { ChatInput } from '../components/ai/ChatInput'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { Modal } from '../components/ui/Modal'
import { cn } from '../utils/cn'
import { useAISessionStore } from '../store/aiSessionStore'
import { aiSessionService } from '../services/aiSessionService'
import { documentService } from '../services/documentService'

const quickActions = [
  { label: 'New Query', description: 'Ask YourCase assistant', icon: Bot, color: 'bg-blue-500/10 text-blue-600' },
  { label: 'Upload Document', description: 'Analyze new evidence', icon: Upload, color: 'bg-slate-500/10 text-slate-600' },
  { label: 'Create Matter', description: 'Track new engagement', icon: Plus, color: 'bg-emerald-500/10 text-emerald-600' },
  { label: 'Run Workflow', description: 'Automate review', icon: Play, color: 'bg-amber-500/10 text-amber-600' },
]

export default function AIAssistant() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const {
    sessions,
    activeSessionId,
    messages,
    isLoading,
    attachedDocuments,
    settings,
    setSessions,
    addSession,
    setActiveSession,
    setMessages,
    appendMessage,
    setLoading,
    clearConversation,
    clearDocuments,
    attachDocument,
    detachDocument,
    updateSettings,
    ensureActiveSession,
  } = useAISessionStore()

  const [showAttach, setShowAttach] = useState(false)
  const [docList, setDocList] = useState([])
  const [docLoading, setDocLoading] = useState(false)
  const [docError, setDocError] = useState('')
  const [sessionError, setSessionError] = useState('')
  const [pendingPrompt, setPendingPrompt] = useState('')

  const { data: sessionList, isLoading: sessionsLoading } = useQuery({
    queryKey: ['ai-sessions'],
    queryFn: aiSessionService.listSessions,
    onSuccess: (data) => {
      setSessions(data)
    },
  })

  const loadSession = useCallback(
    async (sessionId) => {
      setLoading(true)
      try {
        const { session, messages: history } = await aiSessionService.getSession(sessionId)
        setActiveSession(session.id, history)
        setMessages(history)
        if (session) {
          const params = new URLSearchParams(location.search)
          if (params.get('session') !== session.id) {
            params.set('session', session.id)
            navigate({ pathname: location.pathname, search: params.toString() }, { replace: true })
          }
        }
      } catch (error) {
        setSessionError(error?.message || 'Failed to load conversation')
      } finally {
        setLoading(false)
      }
    },
    [location.pathname, location.search, navigate, setActiveSession, setLoading, setMessages],
  )

  const askMutation = useMutation({
    mutationFn: aiSessionService.askQuestion,
    onSuccess: (response) => {
      const { sessionId, message } = response
      const userMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: pendingPrompt,
        createdAt: new Date().toISOString(),
      }
      appendMessage(userMessage)

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: message?.content || message?.response?.content || '—',
        createdAt: new Date().toISOString(),
        response: message,
      }
      appendMessage(assistantMessage)

      setPendingPrompt('')
      queryClient.invalidateQueries(['ai-sessions'])
      setTimeout(() => loadSession(sessionId), 0)
    },
    onError: (error) => {
      setSessionError(error?.message || 'Failed to get AI response')
    },
    onSettled: () => {
      setLoading(false)
    },
  })

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const currentSession = params.get('session')
    if (currentSession) {
      loadSession(currentSession)
    } else if (sessionList && sessionList.length) {
      loadSession(sessionList[0].id)
    }
  }, [location.search, sessionList, loadSession])

  const groupedSessions = useMemo(() => {
    return sessions.map((session) => ({
      id: session.id,
      title: session.title || 'Conversation',
      queryType: session.queryType,
      lastMessageAt: session.lastMessageAt,
      preview: session.messages?.at(-1)?.content || session.lastResponsePreview || session.lastPrompt,
      messageCount: session.messageCount,
    }))
  }, [sessions])

  const handleSend = (value) => {
    const sessionId = activeSessionId || ensureActiveSession()
    setPendingPrompt(value)
    setLoading(true)
    askMutation.mutate({
      prompt: value,
      queryType: settings.queryType,
      model: settings.model,
      sessionId,
      attachedDocuments: attachedDocuments.map((doc) => doc.id || doc._id || doc),
    })
  }

  const handleNewSession = async () => {
    try {
      const session = await aiSessionService.createSession({ queryType: settings.queryType, model: settings.model })
      if (session) {
        addSession(session)
        setActiveSession(session.id, [])
        setMessages([])
        const params = new URLSearchParams(location.search)
        params.set('session', session.id)
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: true })
      }
    } catch (error) {
      setSessionError(error?.message || 'Failed to start a new conversation')
    }
  }

  const handleDeleteSession = async (sessionId) => {
    try {
      await aiSessionService.deleteSession(sessionId)
      queryClient.invalidateQueries(['ai-sessions'])
      setSessionError('')
      if (activeSessionId === sessionId) {
        clearConversation();
        clearDocuments()
        const params = new URLSearchParams(location.search)
        params.delete('session')
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: true })
      }
    } catch (error) {
      setSessionError(error?.message || 'Failed to delete conversation')
    }
  }

  const openAttachModal = async () => {
    setShowAttach(true)
    setDocLoading(true)
    setDocError('')
    try {
      const result = await documentService.getDocuments({}, { page: 1, limit: 100 })
      setDocList(result.items)
    } catch (error) {
      setDocError(error?.message || 'Failed to load documents')
    } finally {
      setDocLoading(false)
    }
  }

  const toggleDocument = (doc) => {
    const id = doc.id || doc._id
    const exists = attachedDocuments.find((item) => (item.id || item._id) === id)
    if (exists) {
      detachDocument(id)
    } else {
      attachDocument(doc)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Assistant"
        description="Ask legal-grade AI questions with full context awareness."
        actions={
          <div className="flex items-center gap-3">
            <Button icon={Sparkles} onClick={handleNewSession}>
              New conversation
            </Button>
            <Button variant="ghost" icon={RotateCcw} onClick={() => activeSessionId && loadSession(activeSessionId)}>
              Refresh
            </Button>
          </div>
        }
      />

      {sessionError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{sessionError}</div>
      )}

      <div className="grid min-h-[70vh] gap-6 xl:grid-cols-[320px_1fr_320px]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <Button size="sm" icon={Sparkles} className="w-full justify-center" onClick={handleNewSession}>
              New chat
            </Button>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <label className="flex items-center gap-2 text-xs text-slate-500">
              <Search className="h-4 w-4" />
              <input className="w-full border-none bg-transparent text-sm outline-none" placeholder="Search conversations" />
            </label>
          </div>

          <div className="mt-4 space-y-2 overflow-y-auto pr-2">
            {sessionsLoading ? (
              <div className="space-y-3">
                <Skeleton variant="text" height={18} />
                <Skeleton variant="text" height={18} />
                <Skeleton variant="text" height={18} />
              </div>
            ) : groupedSessions.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-6 text-center text-xs text-slate-400">
                No conversations yet.
              </div>
            ) : (
              groupedSessions.map((session) => (
                <div
                  key={session.id}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    'w-full rounded-2xl border border-slate-100 px-3 py-3 text-left text-sm text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50/60 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-200',
                    session.id === activeSessionId && 'border-indigo-300 bg-indigo-50/70 text-indigo-700',
                  )}
                  onClick={() => loadSession(session.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      loadSession(session.id)
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-800">
                      {session.title?.slice(0, 60) || 'Conversation'}
                      {(session.title?.length || 0) > 60 ? '…' : ''}
                    </p>
                    <span
                      role='button'
                      tabIndex={0}
                      className='rounded-full p-1 text-slate-400 transition hover:text-rose-500 focus:outline-none'
                      onClick={(event) => {
                        event.stopPropagation()
                        handleDeleteSession(session.id)
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          event.stopPropagation()
                          handleDeleteSession(session.id)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    {session.preview?.slice(0, 80) || '—'}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                    <Badge variant="info" size="sm">
                      {session.queryType}
                    </Badge>
                    <span>{session.messageCount} turns</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <section className="flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <select
                value={settings.queryType}
                onChange={(event) => updateSettings({ queryType: event.target.value })}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                <option value="chat">Chat</option>
                <option value="research">Research</option>
                <option value="drafting">Drafting</option>
                <option value="analysis">Analysis</option>
                <option value="compliance">Compliance</option>
              </select>
              <select
                value={settings.model}
                onChange={(event) => updateSettings({ model: event.target.value })}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash</option>
                <option value="gemini-1.5-pro-002">Gemini 1.5 Pro</option>
              </select>
            </div>
            <Button variant="ghost" onClick={handleNewSession}>
              Clear chat
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {messages?.length ? (
              messages.map((message, index) => (
                <ChatMessage
                  key={`${message.queryId || message.id || index}-${message.createdAt}`}
                  message={message.content}
                  isUser={message.role === 'user'}
                  timestamp={new Date(message.createdAt).toLocaleTimeString()}
                  onCopy={() => navigator.clipboard.writeText(message.content)}
                  onRegenerate={message.role === 'assistant' ? () => handleSend(pendingPrompt || message.prompt || '') : undefined}
                />
              ))
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-400">
                <Sparkles className="h-8 w-8" />
                <p>Start a conversation with YourCase AI assistant.</p>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="inline-flex h-2 w-2 animate-[pulse_1.4s_linear_infinite] rounded-full bg-blue-500" />
                YourCase is thinking…
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 px-6 py-4">
            {attachedDocuments.length > 0 && (
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {attachedDocuments.map((doc) => (
                  <Badge key={doc.id || doc._id} variant="secondary" size="sm" className="flex items-center gap-2">
                    {doc.name || doc.originalName || 'Document'}
                    <button type="button" className="text-slate-400 hover:text-slate-600" onClick={() => detachDocument(doc.id || doc._id)}>
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <ChatInput loading={isLoading} onSubmit={handleSend} onAttach={openAttachModal} />
          </div>
        </section>

        <aside className="hidden h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:block">
          <h2 className="text-lg font-semibold text-slate-800">Context</h2>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Attached documents</h3>
                <Button variant="ghost" size="sm" icon={Paperclip} iconPosition="right" onClick={openAttachModal}>
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
                  <div
                    key={action.label}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-left transition hover:border-blue-100 hover:bg-blue-50/60 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    role="button"
                    tabIndex={0}
                    onClick={() => {/* future quick actions */}}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                      }
                    }}
                  >
                    <span className={cn('rounded-2xl p-3 shadow-sm', action.color)}>
                      <action.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{action.label}</p>
                      <p className="text-xs text-slate-500">{action.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <Modal open={showAttach} onClose={() => setShowAttach(false)} title="Attach documents">
        <div className="space-y-4">
          {docError && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{docError}</div>}
          {docLoading ? (
            <div className="space-y-2">
              <Skeleton variant="text" height={16} />
              <Skeleton variant="text" height={16} />
              <Skeleton variant="text" height={16} />
            </div>
          ) : (
            <div className="space-y-2">
              {docList.map((doc) => {
                const id = doc.id || doc._id
                const isChecked = attachedDocuments.some((item) => (item.id || item._id) === id)
                return (
                  <label
                    key={id}
                    htmlFor={`attach-${id}`}
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm transition hover:border-indigo-200 hover:bg-indigo-50/70',
                      isChecked && 'border-indigo-300 bg-indigo-50',
                    )}
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{doc.name}</p>
                      <p className="text-xs text-slate-500">{doc.type || 'Document'} · {doc.size || '—'}</p>
                    </div>
                    <input
                      id={`attach-${id}`}
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleDocument(doc)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                )
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

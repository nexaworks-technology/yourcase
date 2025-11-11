export interface AISessionMeta {
  id: string
  title: string
  queryType: string
  model?: string
  messageCount: number
  lastMessageAt?: string
  preview?: string
  createdAt?: string
  updatedAt?: string
  isArchived?: boolean
}

export interface AIMessage {
  id: string
  queryId?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: string
  response?: {
    content?: string
    model?: string
    tokensUsed?: number
  }
}

export interface AISessionPayload {
  session: AISessionMeta
  messages: AIMessage[]
}


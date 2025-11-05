import { useState } from 'react'
import PropTypes from 'prop-types'
import { Bot, Loader2, Send } from 'lucide-react'

import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

export function AskAboutDocumentModal({ isOpen, onClose, onSubmit, history = [] }) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!question.trim()) {
      setError('Ask a meaningful question about the document context')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await onSubmit?.(question)
      setQuestion('')
    } catch (submitError) {
      setError(submitError?.message || 'Unable to process your query')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setQuestion('')
        setError(null)
        onClose?.()
      }}
      title="Ask AI about this document"
      size="lg"
      footer={
        <div className="flex items-center justify-between text-xs text-slate-400">
          <p>Powered by YourCase legal reasoning models · Context aware</p>
        </div>
      }
    >
      <div className="space-y-5">
        <Card className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4">
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Ask contextual questions</h3>
              <p className="text-xs text-slate-600">YourCase AI will scan the entire document and respond with citations to relevant passages.</p>
            </div>
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            label="Your question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="e.g., Summarize key termination clauses and highlight any non-standard obligations."
            rows={4}
            error={error}
            required
          />
          <div className="flex items-center justify-between">
            <Input label="Reference tags (optional)" placeholder="e.g., Board Review, Funding" />
            <Button type="submit" variant="primary" icon={Send} loading={loading} className="ml-4">
              Ask YourCase AI
            </Button>
          </div>
        </form>

        {history.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900">Recent questions</h4>
            <div className="space-y-2">
              {history.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3 text-sm">
                  <p className="font-medium text-slate-900">{item.question}</p>
                  <p className="mt-1 text-xs text-slate-500">Asked {new Date(item.createdAt).toLocaleString()}</p>
                  {item.answer ? (
                    <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
                  ) : (
                    <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing answer…
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

AskAboutDocumentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  history: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      question: PropTypes.string.isRequired,
      answer: PropTypes.string,
      createdAt: PropTypes.string.isRequired,
    }),
  ),
}

AskAboutDocumentModal.defaultProps = {
  onSubmit: undefined,
  history: [],
}

export default AskAboutDocumentModal

import { useState } from 'react'
import { Modal } from '../components/ui/Modal'

// Minimal placeholder AIAssistant component to ensure the frontend builds.
export default function AIAssistant() {
  const [pendingPrompt, setPendingPrompt] = useState('')
  const [showAttach, setShowAttach] = useState(false)

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <main className="flex-1 p-6">
        <h1 className="text-xl font-semibold mb-4">AI Assistant</h1>
        <textarea
          value={pendingPrompt}
          onChange={(e) => setPendingPrompt(e.target.value)}
          placeholder="Send a message…"
          className="w-full min-h-[120px] rounded-md border p-3"
        />
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAttach(true)}
            className="rounded-full bg-slate-200 px-3 py-1 text-sm"
          >
            Attach file
          </button>
        </div>
      </main>

      <aside className="hidden xl:flex w-72 p-4">
        <div className="rounded-2xl border p-4 w-full">
          <h3 className="text-sm font-semibold">Shortcuts</h3>
          <p className="mt-2 text-sm text-slate-500">Quick actions and saved prompts will appear here.</p>
        </div>
      </aside>

      {showAttach && (
        <Modal onClose={() => setShowAttach(false)}>
          <div className="p-4">
            <h2 className="text-lg font-semibold">Attach documents</h2>
            <p className="mt-2 text-sm text-slate-600">Select a document to attach (placeholder).</p>
          </div>
        </Modal>
      )}
    </div>
  )
}

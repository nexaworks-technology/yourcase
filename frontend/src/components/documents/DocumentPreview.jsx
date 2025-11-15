import PropTypes from 'prop-types'
import { formatDistanceToNow } from 'date-fns'
import { FileIcon, Bot, Download, Trash2 } from 'lucide-react'

export function DocumentPreview({
  document,
  onAnalyze,
  onDownload,
  onDelete,
  onClose,
}) {
  if (!document) return null

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{document.name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
            Uploaded {formatDistanceToNow(new Date(document.uploadedAt), { addSuffix: true })}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500" onClick={onClose}>
            Close
          </button>
        </div>
      </header>
      <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 p-4">
          <FileIcon className="h-8 w-8 text-blue-600" />
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">{document.type}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{document.size} · .{document.extension}</p>
          </div>
        </div>
        <p>{document.raw?.analysis?.summary || 'No AI analysis available yet.'}</p>
      </div>
      <footer className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <Bot className="h-4 w-4" />
          YourCase AI
        </div>
        <div className="flex gap-2">
          <button type="button" className="rounded-xl bg-blue-600 px-3 py-2 text-sm text-white" onClick={onAnalyze}>
            Analyze
          </button>
          <button type="button" className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-600 dark:text-slate-300" onClick={onDownload}>
            Download
          </button>
          <button type="button" className="rounded-xl border border-rose-200 px-3 py-2 text-sm text-rose-600" onClick={onDelete}>
            <Trash2 className="mr-1 inline h-4 w-4" /> Delete
          </button>
        </div>
      </footer>
    </div>
  )
}

DocumentPreview.propTypes = {
  document: PropTypes.object,
  onAnalyze: PropTypes.func,
  onDownload: PropTypes.func,
  onDelete: PropTypes.func,
  onClose: PropTypes.func,
}

DocumentPreview.defaultProps = {
  document: null,
  onAnalyze: undefined,
  onDownload: undefined,
  onDelete: undefined,
  onClose: undefined,
}

export default DocumentPreview

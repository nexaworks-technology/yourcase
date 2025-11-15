import PropTypes from 'prop-types'
import { useState } from 'react'
import { Plus, Search } from 'lucide-react'

import { DocumentCard } from './DocumentCard'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Alert } from '../ui/Alert'

export function DocumentsModule({ documents = [], onUpload, onAnalyze, onDownload }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const filtered = documents.filter((document) => {
    const matchesSearch = document.name?.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'all' || document.type === typeFilter
    return matchesSearch && matchesType
  })

  const types = Array.from(new Set(documents.map((document) => document.type).filter(Boolean)))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <form className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search documents"
              className="w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-10 pr-3 text-sm text-slate-700 dark:text-slate-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20"
            />
          </form>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 px-2 py-1 text-xs text-slate-600 dark:text-slate-300">
            <span>Type</span>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="bg-transparent focus:outline-none"
            >
              <option value="all">All</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={onUpload}>
          Upload document
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            onPreview={() => onDownload?.(document.id)}
            onAnalyze={() => onAnalyze?.(document.id)}
            onDownload={() => onDownload?.(document.id)}
            onDelete={() => {}}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <Alert
          variant="info"
          title="No documents yet"
          message="Upload documents to start organizing this matter's knowledge base."
        />
      )}
    </div>
  )
}

DocumentsModule.propTypes = {
  matterId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  documents: PropTypes.array,
  onUpload: PropTypes.func,
  onAnalyze: PropTypes.func,
  onDownload: PropTypes.func,
}

DocumentsModule.defaultProps = {
  matterId: undefined,
  documents: [],
  onUpload: undefined,
  onAnalyze: undefined,
  onDownload: undefined,
}

export default DocumentsModule

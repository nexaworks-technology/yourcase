import PropTypes from 'prop-types'
import { useMemo, useState } from 'react'
import { MessageCircle, Search } from 'lucide-react'

import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Alert } from '../ui/Alert'

const typeColors = {
  summary: 'bg-indigo-50 text-indigo-600',
  analysis: 'bg-blue-50 text-blue-600',
  citation: 'bg-amber-50 text-amber-600',
}

export function QueryList({ queries = [], onAsk }) {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const filtered = useMemo(() => {
    const data = queries.filter((query) => {
      const matchesSearch = query.prompt?.toLowerCase().includes(search.toLowerCase())
      const matchesType = type === 'all' || query.type === type
      return matchesSearch && matchesType
    })
    data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return data
  }, [queries, search, type])

  const types = Array.from(new Set(queries.map((query) => query.type).filter(Boolean)))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <form className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search queries"
              className="w-64 rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </form>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Type</span>
            <select value={type} onChange={(event) => setType(event.target.value)} className="rounded-full border border-slate-200 px-3 py-1 bg-white">
              <option value="all">All</option>
              {types.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button variant="primary" size="sm" icon={MessageCircle} onClick={onAsk}>
          Ask new question
        </Button>
      </div>

      <div className="space-y-3">
        {filtered.map((query) => (
          <article key={query.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <header className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{query.title || 'Matter query'}</h3>
                <p className="text-xs text-slate-500">
                  Asked by {query.user?.name || 'Unknown'} · {new Date(query.createdAt).toLocaleString()}
                </p>
              </div>
              <Badge size="sm" className={typeColors[query.type] || 'bg-slate-100 text-slate-600'}>
                {query.type || 'General'}
              </Badge>
            </header>
            <p className="mt-3 text-sm text-slate-600 line-clamp-3">{query.prompt}</p>
            <footer className="mt-3 flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="sm">
                View full query
              </Button>
            </footer>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <Alert
          variant="info"
          title="No queries yet"
          message="Ask the AI assistant questions about this matter to build a knowledge trail."
        />
      )}
    </div>
  )
}

QueryList.propTypes = {
  queries: PropTypes.array,
  onAsk: PropTypes.func,
}

QueryList.defaultProps = {
  queries: [],
  onAsk: undefined,
}

export default QueryList

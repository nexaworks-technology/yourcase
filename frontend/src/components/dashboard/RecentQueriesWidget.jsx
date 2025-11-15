import PropTypes from 'prop-types'
import { useQuery } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Skeleton } from '../ui/Skeleton'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

const fetchRecentQueries = async () => {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return [
    { id: '1', prompt: 'Summarize the new SEBI compliance notification for fintech startups.', type: 'research', createdAt: new Date().toISOString() },
    { id: '2', prompt: 'Draft a shareholder agreement clause for board control.', type: 'drafting', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { id: '3', prompt: 'Analyze the arbitration precedent against late payment penalties.', type: 'analysis', createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
  ]
}

export function RecentQueriesWidget({ onSelect }) {
  const { data, isLoading } = useQuery({ queryKey: ['recent-queries'], queryFn: fetchRecentQueries })

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Recent AI queries</h2>
        <Badge variant="info" size="sm" dot>
          Live sync
        </Badge>
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-4">
          <Skeleton variant="text" height={18} />
          <Skeleton variant="text" height={18} />
          <Skeleton variant="text" height={18} />
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {data?.map((query) => (
            <li
              key={query.id}
              className="group flex items-start justify-between gap-3 rounded-2xl border border-transparent p-3 transition hover:border-blue-100 hover:bg-blue-50/60"
              onClick={() => onSelect?.(query)}
            >
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600">
                  {query.prompt.length > 80 ? `${query.prompt.slice(0, 80)}…` : query.prompt}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                  <Badge variant="primary" size="sm">{query.type}</Badge>
                  <span>{formatDistanceToNow(new Date(query.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
              <span className="rounded-full bg-blue-100 p-2 text-blue-600">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
            </li>
          ))}
        </ul>
      )}

      <Button variant="ghost" size="sm" className="mt-6" icon={Sparkles} iconPosition="right">
        View all queries
      </Button>
    </div>
  )
}

RecentQueriesWidget.propTypes = {
  onSelect: PropTypes.func,
}

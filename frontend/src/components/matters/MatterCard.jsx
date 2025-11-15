import PropTypes from 'prop-types'
import { format } from 'date-fns'
import { Calendar, FileText, Flag, MoreHorizontal, Users } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Badge } from '../ui/Badge'

const statusStyles = {
  active: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  closed: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
  'on-hold': 'bg-amber-50 text-amber-600 border border-amber-200',
  archived: 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-600',
}

const priorityStyles = {
  low: 'text-slate-400 dark:text-slate-500',
  medium: 'text-amber-500',
  high: 'text-orange-500',
  urgent: 'text-rose-500',
}

export function MatterCard({ matter, onView, onEdit, onArchive }) {
  const {
    id,
    matterNumber,
    clientName,
    title,
    type,
    status,
    priority,
    assignedLawyers = [],
    startDate,
    nextHearing,
    documentsCount = 0,
    progress,
  } = matter

  const formattedStartDate = startDate ? format(new Date(startDate), 'dd MMM yyyy') : '—'
  const formattedNextHearing = nextHearing ? format(new Date(nextHearing), 'dd MMM yyyy') : null
  const displayLawyers = assignedLawyers.slice(0, 3)
  const remainingLawyers = assignedLawyers.length - displayLawyers.length

  const cardStatusStyle = statusStyles[status] || statusStyles.active

  return (
    <div
      className="group relative flex h-full flex-col rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
      onClick={() => onView?.(matter)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => event.key === 'Enter' && onView?.(matter)}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-wide text-slate-400 dark:text-slate-500">{matterNumber || `MAT-${id?.slice(-4)}`}</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{clientName}</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{title}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant="primary" size="sm">
            {type}
          </Badge>
          <Badge className={cn('capitalize', cardStatusStyle)} size="sm">
            {status?.replace('-', ' ') || 'Active'}
          </Badge>
          {priority === 'urgent' && <Flag className={cn('h-4 w-4', priorityStyles[priority])} />}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Started {formattedStartDate}</span>
        </div>
        {formattedNextHearing && (
          <div className="flex items-center gap-2 text-amber-600">
            <Calendar className="h-4 w-4" />
            <span>Next hearing {formattedNextHearing}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>{documentsCount} documents</span>
        </div>
      </div>

      {progress ? (
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full rounded-full bg-blue-500" style={{ width: `${progress}%` }} />
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center -space-x-2">
          {displayLawyers.map((lawyer) => (
            <img
              key={lawyer.id}
              src={lawyer.avatar}
              alt={lawyer.name}
              className="h-8 w-8 rounded-full border-2 border-white object-cover"
              title={lawyer.name}
            />
          ))}
          {remainingLawyers > 0 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-200 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
              +{remainingLawyers}
            </div>
          )}
          {assignedLawyers.length === 0 && (
            <div className="flex h-8 items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-3 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
              <Users className="h-4 w-4" />
              Unassigned
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800"
            onClick={(event) => {
              event.stopPropagation()
              onView?.(matter)
            }}
          >
            View
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800"
            onClick={(event) => {
              event.stopPropagation()
              onEdit?.(matter)
            }}
          >
            Edit
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
            onClick={(event) => {
              event.stopPropagation()
              onArchive?.(matter)
            }}
          >
            Archive
          </button>
          <MoreHorizontal className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        </div>
      </div>
    </div>
  )
}

MatterCard.propTypes = {
  matter: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    matterNumber: PropTypes.string,
    clientName: PropTypes.string.isRequired,
    title: PropTypes.string,
    type: PropTypes.string,
    status: PropTypes.string,
    priority: PropTypes.string,
    assignedLawyers: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string,
        avatar: PropTypes.string,
      }),
    ),
    startDate: PropTypes.string,
    nextHearing: PropTypes.string,
    documentsCount: PropTypes.number,
    progress: PropTypes.number,
  }).isRequired,
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  onArchive: PropTypes.func,
}

MatterCard.defaultProps = {
  onView: undefined,
  onEdit: undefined,
  onArchive: undefined,
}

export default MatterCard

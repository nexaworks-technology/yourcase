import PropTypes from 'prop-types'
import { useMemo, useState } from 'react'
import { CalendarDays, Clock, FileText, Filter, Plus, Upload, UserPlus } from 'lucide-react'
import { format } from 'date-fns'

import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { AddEventModal } from './AddEventModal'

const EVENT_ICONS = {
  'status-change': { icon: Clock, tone: 'bg-blue-100 text-blue-600' },
  document: { icon: Upload, tone: 'bg-indigo-100 text-indigo-600' },
  hearing: { icon: CalendarDays, tone: 'bg-amber-100 text-amber-600' },
  team: { icon: UserPlus, tone: 'bg-emerald-100 text-emerald-600' },
  milestone: { icon: FileText, tone: 'bg-purple-100 text-purple-600' },
  note: { icon: FileText, tone: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' },
}

export function MatterTimeline({ events = [], onAddEvent, onExport, onFilter }) {
  const [showModal, setShowModal] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const sortedEvents = useMemo(() => {
    const data = [...events]
    data.sort((a, b) => new Date(b.date) - new Date(a.date))
    if (filterType === 'all') return data
    return data.filter((event) => event.type === filterType)
  }, [events, filterType])

  return (
    <Card variant="bordered" padding="md" className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Matter timeline</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">Track every update, hearing, and milestone across the matter lifecycle.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs text-slate-600 dark:text-slate-300">
            <Filter className="h-3.5 w-3.5" />
            <select
              value={filterType}
              onChange={(event) => {
                setFilterType(event.target.value)
                onFilter?.(event.target.value)
              }}
              className="bg-transparent text-xs focus:outline-none"
            >
              <option value="all">All events</option>
              <option value="status-change">Status changes</option>
              <option value="document">Documents</option>
              <option value="hearing">Hearings</option>
              <option value="team">Team</option>
              <option value="milestone">Milestones</option>
              <option value="note">Notes</option>
            </select>
          </div>
          <Button variant="ghost" size="sm" onClick={onExport}>
            Export timeline
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowModal(true)}>
            Add event
          </Button>
        </div>
      </header>

      <div className="relative">
        <div className="absolute left-6 top-0 h-full w-1 rounded-full bg-gradient-to-b from-blue-100 via-slate-100 to-transparent" />
        <div className="space-y-4">
          {sortedEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
              No timeline events yet. Log hearings, document uploads, and status changes to keep the team aligned.
            </div>
          ) : (
            sortedEvents.map((event) => {
              const config = EVENT_ICONS[event.type] || EVENT_ICONS.note
              const Icon = config.icon
              return (
                <div key={event.id} className="relative ml-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
                  <span className={`absolute -left-12 flex h-10 w-10 items-center justify-center rounded-full border border-white shadow-sm ${config.tone}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{event.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                        {format(new Date(event.date), 'PPP p')} · {event.user || 'System'}
                      </p>
                    </div>
                    <Badge variant="secondary" size="sm">
                      {event.type}
                    </Badge>
                  </div>
                  {event.description && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{event.description}</p>}

                  {event.attachments?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">Attachments</p>
                      <div className="flex flex-wrap gap-2">
                        {event.attachments.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.url}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            {attachment.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      <AddEventModal isOpen={showModal} onClose={() => setShowModal(false)} onSubmit={onAddEvent} />
    </Card>
  )
}

MatterTimeline.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      type: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      date: PropTypes.string.isRequired,
      user: PropTypes.string,
      attachments: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
          name: PropTypes.string,
          url: PropTypes.string,
        }),
      ),
    }),
  ),
  onAddEvent: PropTypes.func,
  onExport: PropTypes.func,
  onFilter: PropTypes.func,
}

MatterTimeline.defaultProps = {
  events: [],
  onAddEvent: undefined,
  onExport: undefined,
  onFilter: undefined,
}

export default MatterTimeline

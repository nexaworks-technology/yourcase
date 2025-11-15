import PropTypes from 'prop-types'
import { differenceInDays, differenceInHours } from 'date-fns'
import { Calendar, Clock3, Gavel, MapPin, Plus } from 'lucide-react'

import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

function formatCountdown(nextHearing) {
  if (!nextHearing) return null
  const hearingDate = new Date(nextHearing)
  const days = differenceInDays(hearingDate, new Date())
  const hours = differenceInHours(hearingDate, new Date()) % 24

  if (days < 0) return 'Hearing completed'
  if (days === 0 && hours >= 0) {
    return `${hours} hour${hours === 1 ? '' : 's'} remaining`
  }
  return `${days} day${days === 1 ? '' : 's'} ${hours}h remaining`
}

export function CourtDetailsCard({ details, hearings = [], onAddHearing }) {
  const countdown = formatCountdown(details?.nextHearing)

  return (
    <Card variant="bordered" padding="md" className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Court details</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">Stay ahead of hearings and filings for litigation matters.</p>
        </div>
        <Button variant="ghost" size="sm" icon={Plus} onClick={onAddHearing}>
          Add hearing
        </Button>
      </header>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">Court name</dt>
          <dd className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <MapPin className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            {details?.courtName || 'Not specified'}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">Case number</dt>
          <dd className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <Gavel className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            {details?.caseNumber || 'Pending'}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">Presiding judge</dt>
          <dd className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <Gavel className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            {details?.judgeName || 'Unassigned'}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">Next hearing</dt>
          <dd className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              {details?.nextHearing ? new Date(details.nextHearing).toLocaleString() : 'Not scheduled'}
            </span>
            {countdown && (
              <Badge variant="warning" size="sm" className="w-max">
                <Clock3 className="mr-1 h-3 w-3" />
                {countdown}
              </Badge>
            )}
          </dd>
        </div>
      </dl>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">Hearing history</h4>
          <Button variant="ghost" size="sm" onClick={onAddHearing}>
            Manage hearings
          </Button>
        </div>
        {hearings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
            No hearings recorded yet. Add the first hearing to stay on top of appearances.
          </div>
        ) : (
          <ul className="space-y-2">
            {hearings.map((hearing) => (
              <li key={hearing.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm shadow-sm">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{hearing.title || 'Court appearance'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                    {new Date(hearing.date).toLocaleString()} · {hearing.judge || 'Judge TBD'}
                  </p>
                </div>
                {hearing.status && (
                  <Badge variant="secondary" size="sm">
                    {hearing.status}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}

CourtDetailsCard.propTypes = {
  details: PropTypes.shape({
    courtName: PropTypes.string,
    caseNumber: PropTypes.string,
    judgeName: PropTypes.string,
    nextHearing: PropTypes.string,
  }),
  hearings: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string,
      date: PropTypes.string.isRequired,
      judge: PropTypes.string,
      status: PropTypes.string,
    }),
  ),
  onAddHearing: PropTypes.func,
}

CourtDetailsCard.defaultProps = {
  details: null,
  hearings: [],
  onAddHearing: undefined,
}

export default CourtDetailsCard

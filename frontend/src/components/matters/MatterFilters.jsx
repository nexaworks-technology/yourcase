import PropTypes from 'prop-types'
import { useMemo } from 'react'
import { Filter, SlidersHorizontal, X } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { cn } from '../../utils/cn'

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'archived', label: 'Archived' },
]

const typeOptions = [
  'Litigation',
  'Corporate',
  'Compliance',
  'Contracts',
  'Tax',
  'IPR',
  'Real Estate',
  'Family Law',
]

const priorityOptions = ['Low', 'Medium', 'High', 'Urgent']

export function MatterFilters({ filters, onChange, onReset, activeCount, lawyers = [], onViewToggle, view }) {
  const activeFilters = useMemo(() => {
    const chips = []
    if (filters.status && filters.status !== 'all') chips.push({ label: `Status: ${filters.status}`, key: 'status' })
    if (filters.types?.length) filters.types.forEach((type) => chips.push({ label: type, key: `type-${type}` }))
    if (filters.priorities?.length) filters.priorities.forEach((priority) => chips.push({ label: `Priority: ${priority}`, key: `priority-${priority}` }))
    if (filters.lawyers?.length) chips.push({ label: `${filters.lawyers.length} lawyers`, key: 'lawyers' })
    if (filters.dateRange?.startDate) chips.push({ label: `From ${filters.dateRange.startDate}`, key: 'dateRange' })
    if (filters.search) chips.push({ label: `Search: ${filters.search}`, key: 'search' })
    return chips
  }, [filters])

  const toggleOption = (field, value) => {
    const current = new Set(filters[field] || [])
    if (current.has(value)) {
      current.delete(value)
    } else {
      current.add(value)
    }
    onChange({ [field]: Array.from(current) })
  }

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <Filter className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <Badge variant="primary" size="sm">
              {activeCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-slate-200 dark:border-slate-700 p-1 text-xs">
            <button
              type="button"
              onClick={() => onViewToggle('card')}
              className={cn('rounded-full px-3 py-1 transition', view === 'card' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800')}
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => onViewToggle('table')}
              className={cn('rounded-full px-3 py-1 transition', view === 'table' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800')}
            >
              Table
            </button>
          </div>
          <Button variant="ghost" size="sm" onClick={onReset}>
            Clear all
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">Status</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                className={cn('rounded-full border px-3 py-1 text-xs font-medium transition', filters.status === option.value ? 'border-blue-200 bg-blue-50 text-blue-600 shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800')}
                onClick={() => onChange({ status: option.value })}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">Matter type</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {typeOptions.map((option) => (
              <button
                type="button"
                key={option}
                className={cn('rounded-full border px-3 py-1 text-xs transition', filters.types?.includes(option) ? 'border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800')}
                onClick={() => toggleOption('types', option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">Priority</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {priorityOptions.map((option) => (
              <button
                type="button"
                key={option}
                className={cn('rounded-full border px-3 py-1 text-xs transition', filters.priorities?.includes(option.toLowerCase()) ? 'border-rose-200 bg-rose-50 text-rose-600 shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800')}
                onClick={() => toggleOption('priorities', option.toLowerCase())}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">Assigned lawyers</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {lawyers.map((lawyer) => (
              <button
                key={lawyer.id}
                type="button"
                className={cn('flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition', filters.lawyers?.includes(lawyer.id)
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800')}
                onClick={() => toggleOption('lawyers', lawyer.id)}
              >
                <img src={lawyer.avatar} alt={lawyer.name} className="h-5 w-5 rounded-full object-cover" />
                {lawyer.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">Start date</p>
          <Input
            type="date"
            value={filters.dateRange?.startDate || ''}
            onChange={(event) => onChange({ dateRange: { ...filters.dateRange, startDate: event.target.value } })}
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">Sort by</p>
          <div className="mt-2 flex items-center gap-2">
            <select
              value={filters.sortBy}
              onChange={(event) => onChange({ sortBy: event.target.value })}
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-600 dark:text-slate-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
            >
              <option value="createdAt">Created date</option>
              <option value="startDate">Start date</option>
              <option value="priority">Priority</option>
              <option value="clientName">Client name</option>
            </select>
            <button
              type="button"
              className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 text-sm text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800"
              onClick={() => onChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </button>
          </div>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Active filters</span>
          {activeFilters.map((chip) => (
            <span key={chip.key} className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs text-slate-600 dark:text-slate-300">
              {chip.label}
              <button
                type="button"
                className="text-slate-400 dark:text-slate-500 transition hover:text-slate-700 dark:hover:text-slate-200 dark:text-slate-300"
                onClick={() => {
                  if (chip.key === 'status') onChange({ status: 'all' })
                  if (chip.key.startsWith('type-')) toggleOption('types', chip.label)
                  if (chip.key.startsWith('priority-')) toggleOption('priorities', chip.label.replace('Priority: ', '').toLowerCase())
                  if (chip.key === 'lawyers') onChange({ lawyers: [] })
                  if (chip.key === 'dateRange') onChange({ dateRange: null })
                  if (chip.key === 'search') onChange({ search: '' })
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

MatterFilters.propTypes = {
  filters: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  activeCount: PropTypes.number,
  lawyers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string,
      avatar: PropTypes.string,
    }),
  ),
  onViewToggle: PropTypes.func.isRequired,
  view: PropTypes.oneOf(['card', 'table']).isRequired,
}

MatterFilters.defaultProps = {
  activeCount: 0,
  lawyers: [],
}

export default MatterFilters

import PropTypes from 'prop-types'
import { useMemo } from 'react'
import { Filter, X } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Badge } from '../ui/Badge'

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'uploaded', label: 'Uploaded' },
  { value: 'processing', label: 'Processing' },
  { value: 'analyzed', label: 'Analyzed' },
  { value: 'failed', label: 'Failed' },
]

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'date', label: 'Date' },
  { value: 'size', label: 'Size' },
  { value: 'type', label: 'Type' },
]

export function DocumentFilters({
  matters,
  documentTypes,
  filters,
  onChange,
  onReset,
  onViewToggle,
  view,
  activeCount,
}) {
  const activeFilters = useMemo(() => {
    const chips = []
    if (filters.matter) chips.push({ key: 'matter', label: `Matter: ${filters.matter.label || filters.matter}` })
    if (filters.types?.length) chips.push({ key: 'types', label: `${filters.types.length} types` })
    if (filters.status && filters.status !== 'all') chips.push({ key: 'status', label: `Status: ${filters.status}` })
    if (filters.dateRange) chips.push({ key: 'dateRange', label: 'Date range' })
    if (filters.search) chips.push({ key: 'search', label: `Search: ${filters.search}` })
    return chips
  }, [filters])

  const handleSelect = (key, value) => {
    onChange({ [key]: value })
  }

  const clearFilter = (key) => {
    if (key === 'types') {
      onChange({ types: [] })
    } else {
      onChange({ [key]: null })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
          <Filter className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <Badge variant="primary" size="sm">
              {activeCount}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <button
            type="button"
            onClick={onViewToggle}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            View: {view === 'grid' ? 'Grid' : 'List'}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Clear all
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          Matter
          <select
            value={filters.matter?.value || ''}
            onChange={(event) => handleSelect('matter', matters.find((matter) => matter.value === event.target.value) || null)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All matters</option>
            {matters.map((matter) => (
              <option key={matter.value} value={matter.value}>
                {matter.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          Document type
          <select
            multiple
            value={filters.types}
            onChange={(event) => {
              const selected = Array.from(event.target.selectedOptions).map((option) => option.value)
              handleSelect('types', selected)
            }}
            className="h-12 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            {documentTypes.map((docType) => (
              <option key={docType.value} value={docType.value}>
                {docType.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          Status
          <select
            value={filters.status}
            onChange={(event) => handleSelect('status', event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          Date range
          <input
            type="date"
            value={filters.dateRange?.from || ''}
            onChange={(event) => handleSelect('dateRange', { ...filters.dateRange, from: event.target.value })}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          Sort by
          <select
            value={filters.sortBy}
            onChange={(event) => handleSelect('sortBy', event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          Order
          <select
            value={filters.sortOrder}
            onChange={(event) => handleSelect('sortOrder', event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => clearFilter(chip.key)}
              className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
            >
              {chip.label}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

DocumentFilters.propTypes = {
  matters: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, label: PropTypes.string })).isRequired,
  documentTypes: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, label: PropTypes.string })).isRequired,
  filters: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onViewToggle: PropTypes.func.isRequired,
  view: PropTypes.oneOf(['grid', 'list']).isRequired,
  activeCount: PropTypes.number,
}

DocumentFilters.defaultProps = {
  activeCount: 0,
}

export default DocumentFilters

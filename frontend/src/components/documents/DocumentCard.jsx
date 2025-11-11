import PropTypes from 'prop-types'
import { formatDistanceToNow } from 'date-fns'
import { Download, Eye, Sparkles, Trash2, FileText, FileType } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Badge } from '../ui/Badge'

const typeColors = {
  pdf: 'bg-rose-100 text-rose-600',
  docx: 'bg-blue-100 text-blue-600',
  txt: 'bg-slate-100 text-slate-600',
  default: 'bg-slate-100 text-slate-500',
}

const statusVariant = {
  uploaded: 'default',
  processing: 'warning',
  analyzed: 'success',
  failed: 'error',
}

function FileIcon({ type }) {
  const Icon = type === 'pdf' ? FileText : FileType
  const colorClass = typeColors[type] || typeColors.default
  return (
    <span className={cn('inline-flex h-12 w-12 items-center justify-center rounded-2xl text-xl', colorClass)}>
      <Icon className="h-6 w-6" aria-hidden="true" />
    </span>
  )
}

FileIcon.propTypes = {
  type: PropTypes.string,
}

export function DocumentCard({ document, onPreview, onAnalyze, onDownload, onDelete, onSelect, selected, view = 'grid' }) {
  const {
    id,
    name,
    extension,
    type,
    matter,
    size,
    uploadedAt,
    status,
    thumbnailUrl,
  } = document

  const fileType = extension?.toLowerCase()
  const statusLabel = status?.replace(/_/g, ' ') ?? 'Uploaded'
  const statusStyle = statusVariant[status] || 'default'

  const actions = [
    { icon: Eye, label: 'Preview', onClick: () => onPreview?.(document) },
    { icon: Sparkles, label: 'Analyze', onClick: () => onAnalyze?.(document) },
    { icon: Download, label: 'Download', onClick: () => onDownload?.(document) },
    { icon: Trash2, label: 'Delete', onClick: () => onDelete?.(document), danger: true },
  ]

  if (view === 'list') {
    return (
      <div className="grid grid-cols-[auto_1.2fr_1fr_1fr_1fr_0.8fr_auto] items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <label className="flex items-center justify-center">
          <input type="checkbox" checked={selected} onChange={() => onSelect?.(id)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400" />
        </label>
        <div className="flex items-center gap-3">
          <FileIcon type={fileType} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
            <p className="truncate text-xs text-slate-500">.{extension}</p>
          </div>
        </div>
        <div className="text-sm text-slate-600">{type || 'General'}</div>
        <div className="text-sm text-blue-600 hover:text-blue-700">
          {matter?.name || 'Unassigned'}
        </div>
        <div className="text-sm text-slate-500">{uploadedAt ? formatDistanceToNow(new Date(uploadedAt), { addSuffix: true }) : '—'}</div>
        <div className="text-sm text-slate-500">{size || '—'}</div>
        <div className="flex items-center justify-end gap-2">
          <Badge variant={statusStyle} size="sm">
            {statusLabel}
          </Badge>
          <div className="relative">
            <details className="group">
              <summary className="list-none rounded-full border border-slate-200 bg-white p-1 text-slate-500 transition hover:text-slate-700">
                ⋮
              </summary>
              <div className="absolute right-0 mt-2 w-36 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                {actions.map(({ icon: Icon, label, onClick, danger }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={onClick}
                    className={cn('flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100', danger && 'text-rose-600 hover:bg-rose-50')}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </details>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <FileIcon type={fileType} />
        <Badge variant={statusStyle} size="sm">
          {statusLabel}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-3">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={name} className="h-40 w-full rounded-2xl object-cover" />
        ) : (
          <div className="flex h-40 w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
            No preview available
          </div>
        )}
        <div className="space-y-1">
          <p className="truncate text-sm font-semibold text-slate-900" title={name}>
            {name}
          </p>
          <p className="text-xs text-slate-500">
            {type || 'General'} · {size || '—'}
          </p>
          <p className="text-xs text-slate-400">
            Uploaded {uploadedAt ? formatDistanceToNow(new Date(uploadedAt), { addSuffix: true }) : '—'}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{matter?.name || 'Unassigned matter'}</span>
        <span>.{extension}</span>
      </div>
      <div className="absolute inset-x-4 bottom-4 flex translate-y-4 items-center justify-between gap-2 rounded-2xl bg-white/90 p-2 opacity-0 shadow-lg transition-all group-hover:translate-y-0 group-hover:opacity-100">
        {actions.map(({ icon: Icon, label, onClick, danger }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className={cn('inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100', danger && 'text-rose-600 hover:bg-rose-50')}
            aria-label={label}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  )
}

DocumentCard.propTypes = {
  document: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    extension: PropTypes.string,
    type: PropTypes.string,
    matter: PropTypes.shape({ name: PropTypes.string }),
    size: PropTypes.string,
    uploadedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    status: PropTypes.string,
    thumbnailUrl: PropTypes.string,
  }).isRequired,
  onPreview: PropTypes.func,
  onAnalyze: PropTypes.func,
  onDownload: PropTypes.func,
  onDelete: PropTypes.func,
  onSelect: PropTypes.func,
  selected: PropTypes.bool,
  view: PropTypes.oneOf(['grid', 'list']),
}

DocumentCard.defaultProps = {
  onPreview: undefined,
  onAnalyze: undefined,
  onDownload: undefined,
  onDelete: undefined,
  onSelect: undefined,
  selected: false,
  view: 'grid',
}

export default DocumentCard

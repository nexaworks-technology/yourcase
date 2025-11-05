import PropTypes from 'prop-types'
import { FileText, Globe, Languages, Star, Users, Wand2 } from 'lucide-react'

import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'

export function TemplateCard({ template, view = 'grid', onUse, onPreview, onEdit, onDuplicate, onDelete }) {
  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="primary" size="sm" onClick={() => onUse?.(template)}>
        Use template
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onPreview?.(template)}>
        Preview
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onEdit?.(template)}>
        Edit
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onDuplicate?.(template)}>
        Duplicate
      </Button>
      <Button variant="danger" size="sm" onClick={() => onDelete?.(template)}>
        Delete
      </Button>
    </div>
  )

  if (view === 'list') {
    return (
      <div className="grid grid-cols-[1.1fr_0.6fr_0.6fr_0.8fr_0.8fr_0.5fr_auto] items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
            <FileText className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">{template.name}</p>
            <p className="text-xs text-slate-500">Updated {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : 'recently'}</p>
          </div>
        </div>
        <Badge variant="primary" size="sm">
          {template.category}
        </Badge>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Globe className="h-4 w-4" />
          {template.jurisdiction || 'All India'}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Languages className="h-4 w-4" />
          {template.language || 'English'}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Users className="h-4 w-4" />
          {template.usageCount ?? 0} uses
        </div>
        <div className="flex items-center gap-1 text-amber-500">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className={cn('h-3.5 w-3.5', index < Math.round(template.rating ?? 0) ? 'fill-current' : 'stroke-current')} />
          ))}
        </div>
        <div className="flex items-center justify-end gap-2">
          {actions}
        </div>
      </div>
    )
  }

  return (
    <Card
      variant="bordered"
      padding="md"
      className="group relative h-full space-y-4 overflow-hidden border border-slate-200 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
          <FileText className="h-6 w-6" />
        </span>
        <Badge variant="primary" size="sm">
          {template.category}
        </Badge>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">{template.name}</h3>
        <p className="text-sm text-slate-500 line-clamp-3">{template.description}</p>
      </div>

      <div className="grid gap-2 text-xs text-slate-500">
        <p className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Jurisdiction: {template.jurisdiction || 'All India'}
        </p>
        <p className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          Language: {template.language || 'English'}
        </p>
        <p className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {template.usageCount ?? 0} uses · Rated {template.rating?.toFixed(1) ?? '—'}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Updated {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : 'recently'}</span>
        {template.aiSuggested && (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-indigo-600">
            <Wand2 className="h-3.5 w-3.5" /> AI assisted
          </span>
        )}
      </div>

      <div className="absolute inset-x-4 bottom-4 flex translate-y-6 items-center gap-2 rounded-2xl bg-white/95 p-3 opacity-0 shadow-lg transition-all group-hover:translate-y-0 group-hover:opacity-100">
        {actions}
      </div>
    </Card>
  )
}

TemplateCard.propTypes = {
  template: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    category: PropTypes.string,
    jurisdiction: PropTypes.string,
    language: PropTypes.string,
    usageCount: PropTypes.number,
    rating: PropTypes.number,
    updatedAt: PropTypes.string,
    aiSuggested: PropTypes.bool,
  }).isRequired,
  view: PropTypes.oneOf(['grid', 'list']),
  onUse: PropTypes.func,
  onPreview: PropTypes.func,
  onEdit: PropTypes.func,
  onDuplicate: PropTypes.func,
  onDelete: PropTypes.func,
}

TemplateCard.defaultProps = {
  view: 'grid',
  onUse: undefined,
  onPreview: undefined,
  onEdit: undefined,
  onDuplicate: undefined,
  onDelete: undefined,
}

export default TemplateCard

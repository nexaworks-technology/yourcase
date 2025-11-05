import PropTypes from 'prop-types'
import { FileDown, Sparkles, Wand2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

export function TemplatePreview({ template, onUse, onDownload }) {
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{template.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Badge variant="primary" size="sm">{template.category}</Badge>
            <span>{template.jurisdiction}</span>
            <span>{template.language}</span>
            {template.aiSuggested && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-indigo-600">
                <Wand2 className="h-3.5 w-3.5" /> AI enhanced
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" icon={FileDown} onClick={() => onDownload?.(template)}>
            Download template
          </Button>
          <Button variant="primary" icon={Sparkles} onClick={() => onUse?.(template)}>
            Use template
          </Button>
        </div>
      </header>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-inner">
        <article className="prose prose-slate max-w-none">
          <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-slate-700">
            {template.sampleContent || template.content || 'Template preview will appear here once content is defined.'}
          </pre>
        </article>
      </div>

      {template.variables?.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Variables</h3>
          <div className="flex flex-wrap gap-2">
            {template.variables.map((variable) => (
              <Badge key={variable.name} variant="secondary" size="sm">
                {variable.label || variable.name}
              </Badge>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

TemplatePreview.propTypes = {
  template: PropTypes.shape({
    name: PropTypes.string.isRequired,
    category: PropTypes.string,
    jurisdiction: PropTypes.string,
    language: PropTypes.string,
    aiSuggested: PropTypes.bool,
    sampleContent: PropTypes.string,
    content: PropTypes.string,
    variables: PropTypes.array,
  }).isRequired,
  onUse: PropTypes.func,
  onDownload: PropTypes.func,
}

TemplatePreview.defaultProps = {
  onUse: undefined,
  onDownload: undefined,
}

export default TemplatePreview

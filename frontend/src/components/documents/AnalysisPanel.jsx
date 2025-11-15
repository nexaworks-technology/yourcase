import PropTypes from 'prop-types'
import { useMemo } from 'react'
import {
  AlertTriangle,
  ArrowRightLeft,
  CalendarClock,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'

import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/cn'

const sections = [
  {
    key: 'summary',
    title: 'Executive Summary',
    icon: FileText,
    variant: 'default',
  },
  {
    key: 'keyPoints',
    title: 'Key Findings',
    icon: CheckCircle2,
    variant: 'primary',
  },
  {
    key: 'parties',
    title: 'Parties Identified',
    icon: Users,
    variant: 'secondary',
  },
  {
    key: 'dates',
    title: 'Important Dates',
    icon: CalendarClock,
    variant: 'info',
  },
  {
    key: 'financials',
    title: 'Financial Highlights',
    icon: ShieldCheck,
    variant: 'success',
  },
  {
    key: 'clauses',
    title: 'Clauses & Obligations',
    icon: ArrowRightLeft,
    variant: 'default',
  },
  {
    key: 'risks',
    title: 'Risks & Red Flags',
    icon: AlertTriangle,
    variant: 'warning',
  },
  {
    key: 'recommendations',
    title: 'Recommendations',
    icon: Sparkles,
    variant: 'success',
  },
]

export function AnalysisPanel({ analysis, loading, onAnalyze, onRegenerate, onExport }) {
  const handleAnalyzeClick = () => {
    // Debug click pipeline
    console.log('[AnalysisPanel] Analyze button clicked', {
      hasOnAnalyze: typeof onAnalyze === 'function',
      loading,
      hasSummary: Boolean(analysis?.summary),
    })
    if (typeof onAnalyze === 'function') {
      try {
        onAnalyze()
      } catch (err) {
        console.error('[AnalysisPanel] onAnalyze threw', err)
      }
    } else {
      console.warn('[AnalysisPanel] onAnalyze is not a function', onAnalyze)
    }
  }

  const handleRegenerateClick = () => {
    console.log('[AnalysisPanel] Regenerate clicked')
    if (typeof onRegenerate === 'function') onRegenerate()
  }
  const hasAnalysis = Boolean(analysis?.summary)

  const confidenceIndicator = useMemo(() => {
    const score = analysis?.confidence ?? 0
    if (score >= 0.85) return { label: 'High confidence', tone: 'success' }
    if (score >= 0.6) return { label: 'Moderate confidence', tone: 'info' }
    if (score > 0) return { label: 'Low confidence', tone: 'warning' }
    return null
  }, [analysis])

  if (!hasAnalysis && !loading) {
    return (
      <Card className="flex h-full flex-col justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-center">
        <div className="mx-auto max-w-sm space-y-4 px-6 py-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Sparkles className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Unlock AI document analysis</h3>
          <p className="text-sm text-slate-500">
            Generate AI-driven summaries, key clause detection, risk assessment, and next-step recommendations tailored to your matter.
          </p>
          <Button variant="primary" size="lg" icon={Sparkles} loading={loading} onClick={handleAnalyzeClick}>
            Analyze document with AI
          </Button>
          <p className="text-xs text-slate-400">Estimated analysis time · Less than 30 seconds</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">AI Analysis</p>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-slate-900">Latest analysis</span>
            {confidenceIndicator && (
              <Badge variant={confidenceIndicator.tone} size="sm">
                {confidenceIndicator.label} ({Math.round((analysis?.confidence ?? 0) * 100)}%)
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Generated {analysis?.generatedAt ? new Date(analysis.generatedAt).toLocaleString() : 'moments ago'} by YourCase AI
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" icon={Download} onClick={() => onExport?.('pdf')}>
            Export PDF
          </Button>
          <Button variant="ghost" size="sm" icon={Download} onClick={() => onExport?.('docx')}>
            Export DOCX
          </Button>
          <Button variant="outline" size="sm" icon={RefreshCcw} onClick={handleRegenerateClick} loading={loading}>
            Regenerate
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map(({ key, title, icon: Icon, variant }) => {
              const content = analysis?.[key]
              if (!content || (Array.isArray(content) && content.length === 0)) {
                return null
              }

              return (
                <section key={key} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <header className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl text-slate-600', variantTone[variant])}>
                        {Icon ? <Icon className="h-5 w-5" /> : null}
                      </span>
                      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      onClick={() => navigator.clipboard.writeText(formatContent(content))}
                    >
                      Copy
                    </button>
                  </header>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    {renderContent(content, key)}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const variantTone = {
  default: 'bg-slate-100 text-slate-600',
  primary: 'bg-blue-100 text-blue-600',
  secondary: 'bg-indigo-100 text-indigo-600',
  info: 'bg-sky-100 text-sky-600',
  success: 'bg-emerald-100 text-emerald-600',
  warning: 'bg-amber-100 text-amber-600',
  danger: 'bg-rose-100 text-rose-600',
}

function renderContent(content, key) {
  if (typeof content === 'string') {
    return <p className="leading-relaxed text-slate-700">{content}</p>
  }

  if (Array.isArray(content)) {
    return (
      <ul className="space-y-2">
        {content.map((item, index) => (
          <li key={index} className="flex items-start gap-2 rounded-xl bg-white p-3 text-sm shadow-sm">
            <CheckCircle2 className="mt-1 h-4 w-4 text-blue-500" />
            <span className="leading-relaxed text-slate-600">{typeof item === 'string' ? item : item?.text}</span>
          </li>
        ))}
      </ul>
    )
  }

  if (key === 'dates' && content?.timeline) {
    return (
      <ol className="relative space-y-4 border-l border-slate-200 pl-4">
        {content.timeline.map((event, index) => (
          <li key={index} className="ml-4 space-y-1">
            <span className="absolute -left-2 mt-0.5 h-3 w-3 rounded-full border border-blue-500 bg-blue-100" />
            <p className="text-xs font-medium uppercase tracking-wide text-blue-600">{event.label}</p>
            <p className="text-sm font-semibold text-slate-900">{event.date}</p>
            {event.description && <p className="text-sm text-slate-500">{event.description}</p>}
          </li>
        ))}
      </ol>
    )
  }

  if (key === 'financials' && content) {
    const entries = Array.isArray(content) ? content : Object.entries(content)
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {entries.map((entry, index) => {
          const [label, value] = Array.isArray(entry) ? entry : [entry.label, entry.value]
          return (
            <div key={index} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">{label}</p>
              <p className="text-lg font-semibold text-emerald-700">{value}</p>
            </div>
          )
        })}
      </div>
    )
  }

  if (key === 'risks' && content) {
    const items = Array.isArray(content) ? content : [content]
    return (
      <div className="space-y-3">
        {items.map((risk, index) => (
          <div key={index} className="rounded-2xl border border-rose-200 bg-rose-50 p-3">
            <p className="text-sm font-semibold text-rose-700">{risk.title || risk.summary || 'Risk identified'}</p>
            <p className="text-xs text-rose-600">{risk.detail || risk.description || risk}</p>
            {risk.severity && (
              <Badge variant="danger" size="xs" className="mt-2">
                Severity: {risk.severity}
              </Badge>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (key === 'parties' && content) {
    const items = Array.isArray(content) ? content : []
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((party, index) => (
          <Badge key={index} variant="outline" size="sm">
            {party.name || party}
          </Badge>
        ))}
      </div>
    )
  }

  return <pre className="rounded-xl bg-white p-3 text-xs text-slate-500">{JSON.stringify(content, null, 2)}</pre>
}

function formatContent(content) {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) return content.map((item) => (typeof item === 'string' ? item : item?.text || JSON.stringify(item))).join('\n- ')
  return JSON.stringify(content, null, 2)
}

AnalysisPanel.propTypes = {
  analysis: PropTypes.shape({
    summary: PropTypes.string,
    keyPoints: PropTypes.array,
    parties: PropTypes.array,
    dates: PropTypes.object,
    financials: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    clauses: PropTypes.array,
    risks: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    recommendations: PropTypes.array,
    confidence: PropTypes.number,
    generatedAt: PropTypes.string,
  }),
  loading: PropTypes.bool,
  onAnalyze: PropTypes.func,
  onRegenerate: PropTypes.func,
  onExport: PropTypes.func,
}

AnalysisPanel.defaultProps = {
  analysis: null,
  loading: false,
  onAnalyze: undefined,
  onRegenerate: undefined,
  onExport: undefined,
}

export default AnalysisPanel

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  Sparkles,
  Paperclip,
  Upload,
  Play,
  Plus,
  Bot,
  ChevronDown,
  Search,
} from 'lucide-react'
import { format } from 'date-fns'
import { PageHeader } from '../components/layout/PageHeader'
import { StatCard } from '../components/dashboard/StatCard'
import { RecentQueriesWidget } from '../components/dashboard/RecentQueriesWidget'
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { dashboardService } from '../services/dashboardService'
import { cn } from '../utils/cn'

const quickActions = [
  { label: 'New Query', description: 'Ask YourCase assistant', icon: Bot, color: 'bg-blue-500/10 text-blue-600' },
  { label: 'Upload Document', description: 'Analyze new evidence', icon: Upload, color: 'bg-slate-500/10 text-slate-600' },
  { label: 'Create Matter', description: 'Track new engagement', icon: Plus, color: 'bg-emerald-500/10 text-emerald-600' },
  { label: 'Run Workflow', description: 'Automate review', icon: Play, color: 'bg-amber-500/10 text-amber-600' },
]

export default function Dashboard() {
  const [selectedQuery, setSelectedQuery] = useState(null)
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: dashboardService.getStats })
  const { data: documents, isLoading: docsLoading } = useQuery({ queryKey: ['dashboard-documents'], queryFn: dashboardService.getRecentDocuments })
  const { data: matters, isLoading: mattersLoading } = useQuery({ queryKey: ['dashboard-matters'], queryFn: dashboardService.getMattersOverview })

  const today = format(new Date(), 'EEEE, MMM d, yyyy')

  return (
    <div className="space-y-10">
      <PageHeader
        title="Dashboard"
        description={
          <span className="text-slate-500">
            Good evening, Alex · {today}
          </span>
        }
        actions={<Button icon={Sparkles}>Start new session</Button>}
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total queries"
          value={stats?.totalQueries.value ?? '—'}
          icon={Sparkles}
          color="primary"
          trend={{ direction: 'up', value: stats?.totalQueries.trend ?? '+0%', caption: 'vs last week' }}
          loading={statsLoading}
        />
        <StatCard
          title="Documents uploaded"
          value={stats?.documentsUploaded.value ?? '—'}
          icon={Paperclip}
          color="secondary"
          footer={`Storage used: ${stats?.documentsUploaded.storageUsed ?? '—'}`}
          loading={statsLoading}
        />
        <StatCard
          title="Active matters"
          value={stats?.activeMatters.value ?? '—'}
          icon={Sparkles}
          color="warning"
          footer={`${stats?.activeMatters.urgent ?? 0} require urgent action`}
          loading={statsLoading}
        />
        <StatCard
          title="API usage"
          value={`${stats?.apiUsage.used ?? 0}/${stats?.apiUsage.limit ?? 0}`}
          icon={Sparkles}
          color="success"
          footer={`Queries left: ${(stats?.apiUsage.limit ?? 0) - (stats?.apiUsage.used ?? 0)}`}
          loading={statsLoading}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentQueriesWidget onSelect={(query) => setSelectedQuery(query)} />

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Recent documents</h2>
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </div>
            {docsLoading ? (
              <div className="mt-6 space-y-4">
                <Skeleton variant="text" height={18} />
                <Skeleton variant="text" height={18} />
                <Skeleton variant="text" height={18} />
              </div>
            ) : (
              <ul className="mt-6 space-y-4">
                {documents?.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-transparent p-3 transition hover:border-slate-200 hover:bg-slate-50/60"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{doc.name}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                        <Badge variant="info" size="sm">
                          {doc.type}
                        </Badge>
                        <span>{format(new Date(doc.uploadedAt), 'MMM d, hh:mm a')}</span>
                        <span>{doc.size}</span>
                      </div>
                    </div>
                    <Badge variant={doc.status === 'analyzed' ? 'success' : 'warning'} size="sm" dot>
                      {doc.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Active matters</h2>
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </div>
            {mattersLoading ? (
              <div className="mt-6 space-y-4">
                <Skeleton variant="text" height={18} />
                <Skeleton variant="text" height={18} />
              </div>
            ) : (
              <ul className="mt-6 space-y-4">
                {matters?.map((matter) => (
                  <li key={matter.id} className="rounded-2xl border border-slate-200/70 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">{matter.title}</p>
                      <Badge variant={matter.status === 'urgent' ? 'error' : 'success'} size="sm" dot>
                        {matter.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Due {format(new Date(matter.dueDate), 'MMM d, yyyy')}</p>
                    <p className="mt-1 text-xs text-slate-400">Assigned to: {matter.lawyers.join(', ')}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <ActivityTimeline />
        </div>

        <aside className="hidden h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:block">
          <h2 className="text-lg font-semibold text-slate-800">Quick actions</h2>
          <p className="mt-1 text-sm text-slate-500">Jump into workflows you run frequently.</p>

          <div className="mt-6 space-y-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-left transition hover:border-blue-100 hover:bg-blue-50/60"
              >
                <span className={cn('rounded-2xl p-3 shadow-sm', action.color)}>
                  <action.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{action.label}</p>
                  <p className="text-xs text-slate-500">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

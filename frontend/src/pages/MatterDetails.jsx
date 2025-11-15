import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Archive,
  CalendarDays,
  ChevronRight,
  Download,
  Edit,
  FileSpreadsheet,
  Flag,
  Layers,
  Loader2,
  MoreVertical,
  ShieldAlert,
  Trash2,
  Users,
} from 'lucide-react'

import { matterService } from '../services/matterService'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { Alert } from '../components/ui/Alert'
import { MatterTimeline } from '../components/matters/MatterTimeline'
import { TeamManagement } from '../components/matters/TeamManagement'
import { CourtDetailsCard } from '../components/matters/CourtDetailsCard'
import { TabGroup } from '../components/ui/TabGroup'
import { DocumentsModule } from '../components/documents/DocumentsModule'
import { QueryList } from '../components/ai/QueryList'
import { FinancialSummary } from '../components/dashboard/FinancialSummary'
import { Modal } from '../components/ui/Modal'
import { CreateMatterModal } from '../components/matters/CreateMatterModal'

const tabs = ['Overview', 'Documents', 'Queries', 'Timeline', 'Team', 'Financials']

export default function MatterDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('Overview')
  const [showEdit, setShowEdit] = useState(false)
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [notice, setNotice] = useState(null)

  const {
    data: matter,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['matter', id],
    queryFn: () => matterService.getMatterById(id),
    enabled: Boolean(id),
  })

  const archiveMutation = useMutation({
    mutationFn: () => matterService.updateMatter(id, { status: 'archived' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['matter', id])
      queryClient.invalidateQueries(['matters'])
      setShowArchiveConfirm(false)
      setNotice({ type: 'success', message: 'Matter archived successfully.' })
    },
    onError: (err) => setNotice({ type: 'error', message: err.message || 'Failed to archive matter.' }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => matterService.deleteMatter(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['matters'])
      setShowDeleteConfirm(false)
      navigate('/matters')
    },
    onError: (err) => setNotice({ type: 'error', message: err.message || 'Failed to delete matter.' }),
  })

  const exportMutation = useMutation({
    mutationFn: () => matterService.exportMatter(id),
    onError: (err) => setNotice({ type: 'error', message: err.message || 'Failed to export matter.' }),
  })
  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `matter-${matter?.matterNumber || id}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (_) {}
  }

  const statusTone = useMemo(() => {
    switch (matter?.status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-600'
      case 'closed':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
      case 'on-hold':
        return 'bg-amber-100 text-amber-600'
      case 'archived':
        return 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 dark:text-slate-500'
      default:
        return 'bg-blue-100 text-blue-600'
    }
  }, [matter?.status])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mt-20 flex flex-col items-center gap-4">
        <ShieldAlert className="h-10 w-10 text-rose-500" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Unable to load matter</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">{error?.message || 'Please try again later.'}</p>
        <Button variant="primary" onClick={() => navigate('/matters')}>
          Back to matters
        </Button>
      </div>
    )
  }

  const tabsNav = (
    <TabGroup tabs={tabs.map((tab) => ({ value: tab, label: tab }))} activeTab={activeTab} onChange={setActiveTab} />
  )

  const matterStats = matter?.stats || {}
  const overviewCards = [
    { label: 'Documents uploaded', value: matterStats.documents || 0, icon: Layers, tone: 'bg-blue-50 text-blue-600' },
    { label: 'AI queries', value: matterStats.queries || 0, icon: FileSpreadsheet, tone: 'bg-indigo-50 text-indigo-600' },
    { label: 'Team members', value: matterStats.team || (matter?.team?.length ?? 0), icon: Users, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Days active', value: matterStats.daysActive || 0, icon: CalendarDays, tone: 'bg-amber-50 text-amber-600' },
  ]

  const overviewTab = (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        <Card variant="bordered" padding="md" className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{matter.title}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" size="sm">
                  {matter.type}
                </Badge>
                <Badge size="sm" className="capitalize bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {matter.status}
                </Badge>
                {matter.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <Button variant="ghost" size="sm" icon={Edit} onClick={() => setShowEdit(true)}>
              Edit
            </Button>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">{matter.description || 'No description provided yet.'}</p>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Start date</dt>
              <dd className="text-sm text-slate-700 dark:text-slate-300">{matter.startDate ? new Date(matter.startDate).toLocaleDateString() : '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Expected end</dt>
              <dd className="text-sm text-slate-700 dark:text-slate-300">{matter.expectedEndDate ? new Date(matter.expectedEndDate).toLocaleDateString() : '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Current status</dt>
              <dd className="text-sm text-slate-700 dark:text-slate-300 capitalize">{matter.status}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Priority</dt>
              <dd className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <Flag className="h-4 w-4" />
                <span className="capitalize">{matter.priority || 'medium'}</span>
              </dd>
            </div>
          </dl>
        </Card>

        {matter.courtDetails && (
          <CourtDetailsCard
            details={matter.courtDetails}
            hearings={matter.hearings}
            onAddHearing={() => setNotice({ type: 'info', message: 'Hearing management coming soon.' })}
          />
        )}

        <Card variant="bordered" padding="md">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent activity</h3>
          <ul className="mt-4 space-y-3">
            {(matter.activity || []).slice(0, 10).map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 shadow-sm">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{item.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{item.description}</p>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500">{new Date(item.date).toLocaleString()}</span>
              </li>
            ))}
            {(matter.activity || []).length === 0 && <li className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-center text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">No activity yet.</li>}
          </ul>
        </Card>
      </div>

      <div className="space-y-6">
        <Card variant="bordered" padding="md" className="space-y-4">
          <div className="flex items-center gap-3">
            <img src={matter.client?.avatar} alt={matter.client?.name} className="h-12 w-12 rounded-full object-cover" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{matter.client?.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">Client</p>
            </div>
          </div>
          <dl className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between">
              <dt>Email</dt>
              <dd className="text-blue-600">{matter.client?.email || '—'}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Phone</dt>
              <dd>{matter.client?.phone || '—'}</dd>
            </div>
          </dl>
          <Button variant="primary" size="sm">
            Contact client
          </Button>
        </Card>

        <div className="grid gap-3">
          {overviewCards.map((card) => (
            <div key={card.label} className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 shadow-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">{card.label}</p>
                <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">{card.value}</p>
              </div>
              <span className={`flex h-10 w-10 items-center justify-center rounded-full ${card.tone}`}>
                <card.icon className="h-5 w-5" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const { data: docsRes } = useQuery({
    queryKey: ['matter', id, 'documents'],
    queryFn: () => matterService.getMatterDocuments(id),
    enabled: Boolean(id),
  })

  const documentsTab = (
    <DocumentsModule
      matterId={id}
      documents={docsRes?.items || docsRes?.data || []}
      onUpload={() => setNotice({ type: 'info', message: 'Document upload from matter details coming soon.' })}
    />
  )

  const { data: queriesRes } = useQuery({
    queryKey: ['matter', id, 'queries'],
    queryFn: () => matterService.getMatterQueries(id),
    enabled: Boolean(id),
  })

  const queriesTab = (
    <QueryList
      queries={queriesRes?.items || queriesRes?.data || []}
      onAsk={() => setNotice({ type: 'info', message: 'Launching AI assistant with matter context soon.' })}
    />
  )

  const { data: timelineRes } = useQuery({
    queryKey: ['matter', id, 'timeline'],
    queryFn: () => matterService.getMatterTimeline(id),
    enabled: Boolean(id),
  })

  const timelineTab = (
    <MatterTimeline
      events={timelineRes?.items || timelineRes?.data || []}
      onAddEvent={(payload) => setNotice({ type: 'info', message: 'Timeline events persistence coming soon.' }) || payload}
      onExport={handleExport}
    />
  )

  const teamTab = (
    <TeamManagement
      matterId={id}
      team={matter.team || []}
      onTeamChanged={() => {
        queryClient.invalidateQueries(['matter', id])
      }}
    />
  )

  const financialsTab = (
    <FinancialSummary
      summary={matter.financials}
      history={matter.payments}
      onAddPayment={() => setNotice({ type: 'info', message: 'Payment entry coming soon.' })}
      onGenerateInvoice={() => setNotice({ type: 'info', message: 'Invoice generation coming soon.' })}
    />
  )

  const tabContent = {
    Overview: overviewTab,
    Documents: documentsTab,
    Queries: queriesTab,
    Timeline: timelineTab,
    Team: teamTab,
    Financials: financialsTab,
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={matter.client?.name || 'Matter details'}
        description={matter.title}
        breadcrumbs={
          <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
            <button type="button" onClick={() => navigate('/matters')} className="text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 dark:text-slate-300">
              Matters
            </button>
            <ChevronRight className="h-3 w-3" />
            <span className="font-mono text-slate-400 dark:text-slate-500">{matter.matterNumber || id}</span>
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge size="lg" className={`font-mono text-base ${statusTone}`}>
              {matter.matterNumber || id}
            </Badge>
            <Badge size="lg" className={`capitalize ${statusTone}`}>
              {matter.status}
            </Badge>
            <Button variant="ghost" icon={Edit} onClick={() => setShowEdit(true)}>
              Edit
            </Button>
            <Button variant="ghost" icon={Archive} onClick={() => setShowArchiveConfirm(true)}>
              Archive
            </Button>
            <div className="relative">
              <details className="group">
                <summary className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:bg-slate-900">
                  More
                  <MoreVertical className="h-4 w-4" />
                </summary>
                <div className="absolute right-0 mt-2 w-40 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-lg">
                  <button type="button" className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800" onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                  <button type="button" className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800" onClick={() => setNotice({ type: 'info', message: 'Duplicate matter coming soon.' })}>
                    Duplicate
                  </button>
                  <button type="button" className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800" onClick={handleExport}>
                    <Download className="h-4 w-4" /> Export
                  </button>
                </div>
              </details>
            </div>
          </div>
        }
      />

      {notice && (
        <Alert
          variant={notice.type === 'success' ? 'success' : notice.type === 'error' ? 'error' : 'info'}
          title={notice.type === 'success' ? 'Success' : notice.type === 'error' ? 'Something went wrong' : 'Heads up'}
          message={notice.message}
          dismissible
          onClose={() => setNotice(null)}
        />
      )}

      {tabsNav}

      <div>{tabContent[activeTab]}</div>

      <CreateMatterModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        onSubmit={(payload) => matterService.updateMatter(id, payload)}
        lawyers={[]}
      />

      <Modal
        isOpen={showArchiveConfirm}
        onClose={() => setShowArchiveConfirm(false)}
        title="Archive matter"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowArchiveConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => archiveMutation.mutate()} loading={archiveMutation.isLoading}>
              Archive matter
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Archiving hides this matter from active views but keeps all documents and timeline events. You can restore it from settings anytime.
        </p>
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete matter"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => deleteMutation.mutate()} loading={deleteMutation.isLoading}>
              Delete permanently
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This permanently removes the matter, its documents, timeline, and insights. This action cannot be undone. Type DELETE to confirm in future flows.
        </p>
      </Modal>
    </div>
  )
}

export { MatterDetails }

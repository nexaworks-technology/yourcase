import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Archive,
  ArrowDownToLine,
  ArrowLeft,
  Calendar,
  ChevronRight,
  FileSpreadsheet,
  LayoutGrid,
  List,
  Search,
  ShieldAlert,
  Users,
} from 'lucide-react'

import { matterService } from '../services/matterService'
import { useMatterStore } from '../store/matterStore'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Alert } from '../components/ui/Alert'
import { MatterFilters } from '../components/matters/MatterFilters'
import { MatterCard } from '../components/matters/MatterCard'
import { CreateMatterModal } from '../components/matters/CreateMatterModal'
import { cn } from '../utils/cn'

const lawyersMock = [
  { id: 'lawyer-1', name: 'Sahil Kapoor', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SK' },
  { id: 'lawyer-2', name: 'Avery Lee', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AL' },
  { id: 'lawyer-3', name: 'Jordan Patel', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=JP' },
  { id: 'lawyer-4', name: 'Morgan Smith', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MS' },
]

export default function Matters() {
  const queryClient = useQueryClient()
  const {
    matters,
    filters,
    pagination,
    stats,
    setMatters,
    setStats,
    setFilters,
    resetFilters,
    setView,
    view,
    selectedIds,
    toggleSelection,
    setSelected,
    clearSelection,
    setPagination,
    addMatter,
    updateMatter,
  } = useMatterStore()

  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [notice, setNotice] = useState(null)
  const [bulkStatus, setBulkStatus] = useState('active')

  const selectedArray = useMemo(() => Array.from(selectedIds), [selectedIds])

  const { isFetching, isError, error, refetch } = useQuery({
    queryKey: ['matters', filters, pagination.page, pagination.limit],
    queryFn: async () => {
      const response = await matterService.getMatters(filters, pagination)
      const items = response.items ?? []
      const meta = response.meta ?? {}
      setMatters(items, {
        page: meta.page ?? pagination.page,
        limit: meta.limit ?? pagination.limit,
        total: meta.total ?? items.length,
      })
      if (response.stats) {
        setStats(response.stats)
      } else {
        const derived = {
          total: items.length,
          active: items.filter((item) => item.status === 'active').length,
          closingSoon: items.filter((item) => item.nextHearing).length,
          overdue: items.filter((item) => item.status === 'on-hold').length,
        }
        setStats(derived)
      }
      return response
    },
    keepPreviousData: true,
  })

  const createMutation = useMutation({
    mutationFn: (payload) => matterService.createMatter(payload),
    onSuccess: (created) => {
      // Normalize created shape
      const normalized = {
        id: created._id || created.id,
        matterNumber: created.matterNumber,
        clientName: created.clientName,
        title: created.matterTitle || created.title,
        type: created.matterType || created.type,
        status: created.status,
        priority: created.priority,
        assignedLawyers: created.assignedLawyers || [],
        startDate: created.startDate,
        nextHearing: created.courtDetails?.nextHearing,
        tags: created.tags || [],
      }
      addMatter(normalized)
      queryClient.invalidateQueries(['matters'])
      setNotice({ type: 'success', message: 'Matter created successfully.' })
    },
    onError: (err) => {
      setNotice({ type: 'error', message: err.message || 'Failed to create matter.' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => matterService.updateMatter(id, data),
    onSuccess: (updated) => {
      updateMatter(updated.id ?? updated._id, updated)
      queryClient.invalidateQueries(['matters'])
    },
    onError: (err) => setNotice({ type: 'error', message: err.message || 'Failed to update matter.' }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => matterService.deleteMatter(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['matters'])
      clearSelection()
    },
    onError: (err) => setNotice({ type: 'error', message: err.message || 'Failed to archive matter.' }),
  })

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    setFilters({ search: searchInput })
  }

  useEffect(() => {
    const handler = setTimeout(() => setFilters({ search: searchInput }), 600)
    return () => clearTimeout(handler)
  }, [searchInput, setFilters])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.status && filters.status !== 'all') count += 1
    count += filters.types?.length ?? 0
    count += filters.priorities?.length ?? 0
    if (filters.lawyers?.length) count += 1
    if (filters.dateRange?.startDate) count += 1
    if (filters.search) count += 1
    return count
  }, [filters])

  const handleViewToggle = (nextView) => setView(nextView)

  const totalPages = useMemo(() => {
    if (!pagination.total || !pagination.limit) return 1
    return Math.max(1, Math.ceil(pagination.total / pagination.limit))
  }, [pagination.total, pagination.limit])

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return
    setPagination({ page: nextPage })
    refetch()
  }

  const handleLimitChange = (event) => {
    setPagination({ limit: Number(event.target.value), page: 1 })
    refetch()
  }

  const handleBulkStatusUpdate = async () => {
    if (selectedArray.length === 0) return
    try {
      await Promise.all(selectedArray.map((id) => updateMutation.mutateAsync({ id, data: { status: bulkStatus } })))
      setNotice({ type: 'success', message: `Updated ${selectedArray.length} matter(s) to ${bulkStatus}.` })
      clearSelection()
      refetch()
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Bulk update failed.' })
    }
  }

  const handleBulkArchive = async () => {
    if (selectedArray.length === 0) return
    try {
      await Promise.all(selectedArray.map((id) => deleteMutation.mutateAsync(id)))
      setNotice({ type: 'success', message: 'Selected matters archived.' })
      clearSelection()
      refetch()
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Bulk archive failed.' })
    }
  }

  const handleBulkAssign = () => {
    setNotice({ type: 'info', message: 'Bulk assign flow coming soon. Use individual matter editing for now.' })
  }

  const handleExportCsv = () => {
    const headers = ['Matter Number', 'Client', 'Title', 'Type', 'Status', 'Priority', 'Start Date', 'Assigned Lawyers']
    const rows = matters.map((matter) => [
      matter.matterNumber,
      matter.clientName,
      matter.title,
      matter.type,
      matter.status,
      matter.priority,
      matter.startDate,
      (matter.assignedLawyers || []).map((lawyer) => lawyer.name).join('; '),
    ])
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => (cell ? `"${String(cell).replace(/"/g, '""')}"` : '""')).join(','))
      .join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = window.document.createElement('a')
    anchor.href = url
    anchor.download = `yourcase-matters-${Date.now()}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const quickStats = [
    {
      label: 'Total matters',
      value: stats.total ?? matters.length,
      description: 'All tracked matters in YourCase',
      icon: LayoutGrid,
      tone: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Active matters',
      value: stats.active ?? matters.filter((item) => item.status === 'active').length,
      description: 'Currently in progress',
      icon: ShieldAlert,
      tone: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Closing this month',
      value: stats.closingSoon ?? matters.filter((item) => item.expectedEndDate).length,
      description: 'Expected to close within 30 days',
      icon: Calendar,
      tone: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Overdue matters',
      value: stats.overdue ?? matters.filter((item) => item.status === 'on-hold').length,
      description: 'Need immediate attention',
      icon: Users,
      tone: 'bg-rose-50 text-rose-600',
    },
  ]

  const emptyState = (
    <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-600 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-12 text-center shadow-inner">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        <LayoutGrid className="h-7 w-7" />
      </div>
      <h3 className="mt-6 text-xl font-semibold text-slate-900 dark:text-slate-100">No matters yet</h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">Create your first client matter to begin managing case documents, hearings, and AI assistance in one workspace.</p>
      <div className="mt-6 flex justify-center">
        <Button variant="primary" size="lg" onClick={() => setShowCreateModal(true)}>
          Create first matter
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title="Client Matters"
        description="Track every client engagement, stay ahead of deadlines, and unlock AI insights for legal workstreams."
        breadcrumbs={
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
            <ArrowLeft className="h-3 w-3" />
            <span>Dashboard</span>
            <ChevronRight className="h-3 w-3" />
            <span>Matters</span>
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search matters..."
                className="w-72 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-10 pr-3 text-sm text-slate-700 dark:text-slate-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20"
              />
            </form>
            <Button variant="primary" size="lg" onClick={() => setShowCreateModal(true)}>
              Create new matter
            </Button>
          </div>
        }
      />

      {notice && (
        <Alert
          variant={notice.type === 'error' ? 'error' : notice.type === 'success' ? 'success' : 'info'}
          title={notice.type === 'success' ? 'Success' : notice.type === 'error' ? 'Something went wrong' : 'Heads up'}
          message={notice.message}
          dismissible
          onClose={() => setNotice(null)}
        />
      )}

      {isError && (
        <Alert
          variant="error"
          title="Unable to load matters"
          message={error?.message || 'Please try again shortly.'}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm"
          >
            <div className={cn('inline-flex h-12 w-12 items-center justify-center rounded-2xl', stat.tone)}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{stat.label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{stat.value}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{stat.description}</p>
          </div>
        ))}
      </div>

      <MatterFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => {
          resetFilters()
          setSearchInput('')
        }}
        activeCount={activeFilterCount}
        lawyers={lawyersMock}
        onViewToggle={handleViewToggle}
        view={view}
      />

      {selectedArray.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm shadow-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Badge variant="primary" size="sm">{selectedArray.length} selected</Badge>
            <span>Bulk actions</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={bulkStatus}
              onChange={(event) => setBulkStatus(event.target.value)}
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-600 dark:text-slate-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
            >
              <option value="active">Mark as Active</option>
              <option value="closed">Mark as Closed</option>
              <option value="on-hold">Mark as On Hold</option>
              <option value="archived">Mark as Archived</option>
            </select>
            <Button variant="ghost" size="sm" onClick={handleBulkStatusUpdate}>
              Update status
            </Button>
            <Button variant="ghost" size="sm" icon={Users} onClick={handleBulkAssign}>
              Assign lawyers
            </Button>
            <Button variant="ghost" size="sm" icon={Archive} onClick={handleBulkArchive}>
              Archive
            </Button>
            <Button variant="ghost" size="sm" icon={FileSpreadsheet} onClick={handleExportCsv}>
              Export CSV
            </Button>
            <button type="button" onClick={clearSelection} className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 dark:text-slate-300">
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {matters.length === 0 && !isFetching ? (
          emptyState
        ) : view === 'card' ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {matters.map((matter) => (
              <MatterCard
                key={matter.id || matter._id}
                matter={matter}
                onView={() => setNotice({ type: 'info', message: 'Matter detail view coming soon.' })}
                onEdit={() => {
                  setNotice({ type: 'info', message: 'Matter editing surface coming soon.' })
                }}
                onArchive={() => deleteMutation.mutate(matter.id || matter._id)}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-400"
                      checked={selectedArray.length === matters.length && matters.length > 0}
                      onChange={(event) => (event.target.checked ? setSelected(matters.map((matter) => matter.id || matter._id)) : clearSelection())}
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Matter #</th>
                  <th className="px-4 py-3 text-left">Client</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-left">Assigned</th>
                  <th className="px-4 py-3 text-left">Start date</th>
                  <th className="px-4 py-3 text-left">Documents</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700 dark:text-slate-300">
                {matters.map((matter) => {
                  const matterId = matter.id || matter._id
                  const assigned = matter.assignedLawyers || []
                  return (
                    <tr key={matterId} className="hover:bg-slate-50 dark:bg-slate-900">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-400"
                          checked={selectedIds.has(matterId)}
                          onChange={() => toggleSelection(matterId)}
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{matter.matterNumber}</td>
                      <td className="px-4 py-3 font-medium">{matter.clientName}</td>
                      <td className="px-4 py-3">{matter.title}</td>
                      <td className="px-4 py-3">
                        <Badge variant="primary" size="sm">
                          {matter.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge size="sm" className="capitalize bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {matter.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 capitalize">{matter.priority}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center -space-x-2">
                          {assigned.slice(0, 3).map((lawyer) => (
                            <img key={lawyer.id} src={lawyer.avatar} alt={lawyer.name} className="h-7 w-7 rounded-full border border-white object-cover" />
                          ))}
                          {assigned.length > 3 && (
                            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white bg-slate-200 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                              +{assigned.length - 3}
                            </span>
                          )}
                          {assigned.length === 0 && <span className="text-xs text-slate-400 dark:text-slate-500">Unassigned</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 dark:text-slate-500">{matter.startDate ? new Date(matter.startDate).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500">{matter.documentsCount ?? 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setNotice({ type: 'info', message: 'Matter detail view coming soon.' })}>
                            View
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setNotice({ type: 'info', message: 'Matter editing surface coming soon.' })}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" icon={Archive} onClick={() => deleteMutation.mutate(matterId)}>
                            Archive
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span>Rows per page</span>
                <select
                  value={pagination.limit}
                  onChange={handleLimitChange}
                  className="h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-sm text-slate-600 dark:text-slate-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
                >
                  {[10, 12, 24, 36].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled={pagination.page === 1} onClick={() => handlePageChange(pagination.page - 1)}>
                  Previous
                </Button>
                <span>
                  Page {pagination.page} of {totalPages}
                </span>
                <Button variant="ghost" size="sm" disabled={pagination.page === totalPages} onClick={() => handlePageChange(pagination.page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isFetching && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-600 shadow-lg">
          <LayoutGrid className="h-4 w-4 animate-spin" />
          Syncing matters…
        </div>
      )}

      <CreateMatterModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(payload) => createMutation.mutate(payload)}
        lawyers={lawyersMock}
      />
    </div>
  )
}

export { Matters }

import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Bot, Download, LayoutGrid, List, Plus, Search, Trash2, Eye } from 'lucide-react'
import { documentService } from '../services/documentService'
import { matterService } from '../services/matterService'
import { useDocumentStore } from '../store/documentStore'
import { PageHeader } from '../components/layout/PageHeader'
import { DocumentFilters } from '../components/documents/DocumentFilters'
import { DocumentUpload } from '../components/documents/DocumentUpload'
import { DocumentCard } from '../components/documents/DocumentCard'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Alert } from '../components/ui/Alert'
import { cn } from '../utils/cn'

export default function Documents() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const {
    documents,
    filters,
    pagination,
    selectedDocuments,
    view,
    setDocuments,
    setFilters,
    resetFilters,
    toggleView,
    selectDocument,
    selectAll,
    clearSelection,
  } = useDocumentStore()

  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [showUpload, setShowUpload] = useState(false)
  const [error, setError] = useState(null)
  const [showBulkTag, setShowBulkTag] = useState(false)
  const [bulkTags, setBulkTags] = useState('')

  // Load matters for filter and upload metadata
  const { data: mattersData } = useQuery({
    queryKey: ['matters-list'],
    queryFn: async () => {
      try {
        const response = await matterService.getMatters({ limit: 100 })
        return (
          response.data?.map((m) => ({ value: m._id || m.id, label: m.matterTitle || m.title })) || []
        )
      } catch (e) {
        console.error('Failed to load matters', e)
        return []
      }
    },
  })

  const matters = mattersData || []

  const documentTypes = [
    { value: 'contract', label: 'Contract' },
    { value: 'case-law', label: 'Case Law' },
    { value: 'evidence', label: 'Evidence' },
    { value: 'correspondence', label: 'Correspondence' },
    { value: 'petition', label: 'Petition' },
    { value: 'judgment', label: 'Judgment' },
    { value: 'agreement', label: 'Agreement' },
    { value: 'notice', label: 'Notice' },
    { value: 'other', label: 'Other' },
  ]

  const { isFetching, refetch } = useQuery({
    queryKey: ['documents', filters, pagination.page, pagination.limit],
    queryFn: async () => {
      const response = await documentService.getDocuments(filters, pagination)
      setDocuments(response.items ?? [], {
        page: response.page ?? 1,
        limit: response.limit ?? 20,
        total: response.total ?? response.items?.length ?? 0,
      })
      return response
    },
    keepPreviousData: true,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => documentService.deleteDocument(id),
    onSuccess: () => {
      clearSelection()
      refetch()
    },
    onError: (mutationError) => {
      setError(mutationError?.message ?? 'Failed to delete document')
    },
  })

  const bulkAnalyzeMutation = useMutation({
    mutationFn: (ids) => Promise.all(ids.map((id) => documentService.analyzeDocument(id))),
    onSuccess: () => {
      clearSelection()
      refetch()
    },
    onError: (mutationError) => {
      setError(mutationError?.message ?? 'Failed to trigger analysis')
    },
  })

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    setFilters({ search: searchInput })
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters({ search: searchInput })
    }, 600)
    return () => clearTimeout(handler)
  }, [searchInput, setFilters])

  const activeFilterCount = useMemo(() => {
    const count = [filters.matter, filters.dateRange, filters.search && filters.search.length > 0].filter(Boolean).length
    return count + (filters.types?.length ?? 0) + (filters.status !== 'all' ? 1 : 0)
  }, [filters])

  const selectedIds = Array.from(selectedDocuments)

  const handleBulkDelete = () => {
    Promise.all(selectedIds.map((id) => deleteMutation.mutateAsync(id))).finally(() => queryClient.invalidateQueries(['documents']))
  }

  const handleBulkAnalyze = () => {
    bulkAnalyzeMutation.mutate(selectedIds)
  }

  const handleBulkDownload = async () => {
    try {
      const blob = await documentService.bulkDownload(selectedIds)
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `documents-${Date.now()}.zip`
      anchor.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message || 'Failed to download documents')
    }
  }

  const handleBulkTag = () => {
    setShowBulkTag(true)
  }

  const handleBulkTagSubmit = async () => {
    const tags = bulkTags.split(',').map((t) => t.trim()).filter(Boolean)
    if (!tags.length) {
      setError('Please enter at least one tag')
      return
    }
    try {
      await documentService.bulkUpdateTags(selectedIds, tags)
      setShowBulkTag(false)
      setBulkTags('')
      clearSelection()
      refetch()
    } catch (err) {
      setError(err.message || 'Failed to update tags')
    }
  }

  const totalPages = Math.ceil((pagination.total || 0) / pagination.limit)

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setDocuments(documents, { ...pagination, page })
    refetch()
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Document Vault"
        description="Centralized repository for every document across YourCase matters."
        breadcrumbs={<span className="text-xs text-slate-500">Home · Documents</span>}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="w-64 rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Search documents..."
              />
            </form>
            <Button variant="primary" icon={Plus} onClick={() => setShowUpload(true)}>
              Upload documents
            </Button>
          </div>
        }
      />

      {error && (
        <Alert variant="error" title="Something went wrong" message={error} dismissible onClose={() => setError(null)} />
      )}

      <DocumentFilters
        matters={matters}
        documentTypes={documentTypes}
        filters={filters}
        onChange={setFilters}
        onReset={resetFilters}
        onViewToggle={toggleView}
        view={view}
        activeCount={activeFilterCount}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>{pagination.total || documents.length} documents</span>
          {selectedIds.length > 0 && (
            <Badge variant="primary" size="sm">
              {selectedIds.length} selected
            </Badge>
          )}
        </div>
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" icon={Download} onClick={handleBulkDownload}>
              Bulk download
            </Button>
            <Button variant="ghost" size="sm" icon={Bot} onClick={handleBulkAnalyze} loading={bulkAnalyzeMutation.isLoading}>
              Analyze with AI
            </Button>
            <Button variant="ghost" size="sm" icon={Plus} onClick={handleBulkTag}>
              Tag
            </Button>
            <Button variant="danger" size="sm" icon={Trash2} onClick={handleBulkDelete} loading={deleteMutation.isLoading}>
              Delete
            </Button>
            <button type="button" onClick={clearSelection} className="text-sm text-slate-500 hover:text-slate-700">
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {view === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {documents.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                view="grid"
                onPreview={() => navigate(`/documents/${document.id}`)}
                onAnalyze={() => bulkAnalyzeMutation.mutate([document.id])}
                onDownload={() => documentService.downloadDocument(document.id).then((blob) => {
                  const url = window.URL.createObjectURL(blob)
                  const anchor = document.createElement('a')
                  anchor.href = url
                  anchor.download = document.name || 'document'
                  anchor.click()
                  window.URL.revokeObjectURL(url)
                }).catch((downloadError) => setError(downloadError.message))}
                onDelete={() => deleteMutation.mutate(document.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-[auto_1.2fr_1fr_1fr_1fr_0.8fr_auto] items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length === documents.length && documents.length > 0}
                  onChange={(event) => (event.target.checked ? selectAll(documents.map((doc) => doc.id)) : clearSelection())}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
                />
              </label>
              <span>Document</span>
              <span>Type</span>
              <span>Matter</span>
              <span>Uploaded</span>
              <span>Size</span>
              <span className="text-right">Status</span>
            </div>
            {documents.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                view="list"
                onSelect={selectDocument}
                selected={selectedDocuments.has(document.id)}
                onPreview={() => navigate(`/documents/${document.id}`)}
                onAnalyze={() => bulkAnalyzeMutation.mutate([document.id])}
                onDownload={() => documentService.downloadDocument(document.id).then((blob) => {
                  const url = window.URL.createObjectURL(blob)
                  const anchor = document.createElement('a')
                  anchor.href = url
                  anchor.download = document.name || 'document'
                  anchor.click()
                  window.URL.revokeObjectURL(url)
                }).catch((downloadError) => setError(downloadError.message))}
                onDelete={() => deleteMutation.mutate(document.id)}
              />
            ))}
          </div>
        )}

        {documents.length === 0 && !isFetching && (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">No documents yet</h3>
            <p className="mt-2 text-sm text-slate-500">Upload your first document to get started with AI-assisted analysis.</p>
            <div className="mt-4 flex justify-center">
              <Button variant="primary" icon={Plus} onClick={() => setShowUpload(true)}>
                Upload document
              </Button>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page - 1)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 hover:bg-slate-100 disabled:opacity-50"
              disabled={pagination.page === 1}
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page + 1)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 hover:bg-slate-100 disabled:opacity-50"
              disabled={pagination.page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showUpload && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/50 p-6">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowUpload(false)}
              className="absolute right-4 top-4 rounded-full border border-slate-200 p-1 text-slate-500 hover:bg-slate-100"
              aria-label="Close upload"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold text-slate-900">Upload Documents</h3>
            <p className="text-sm text-slate-500">Add files to the vault and immediately analyze them with YourCase AI.</p>
            <div className="mt-6">
              <DocumentUpload
                matters={matters}
                documentTypes={documentTypes}
                onSuccess={() => {
                  setShowUpload(false)
                  queryClient.invalidateQueries(['documents'])
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showBulkTag && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/50 p-6">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowBulkTag(false)}
              className="absolute right-4 top-4 rounded-full border border-slate-200 p-1 text-slate-500 hover:bg-slate-100"
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold text-slate-900">Add Tags to Selected Documents</h3>
            <p className="text-sm text-slate-500">Enter tags separated by commas</p>
            <div className="mt-6 space-y-4">
              <input
                type="text"
                value={bulkTags}
                onChange={(e) => setBulkTags(e.target.value)}
                placeholder="legal, reviewed, urgent"
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowBulkTag(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleBulkTagSubmit}>
                  Apply Tags
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFetching && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-600 shadow-lg">
          <LayoutGrid className="h-4 w-4 animate-spin" />
          Syncing documents…
        </div>
      )}
    </div>
  )
}

export { Documents }

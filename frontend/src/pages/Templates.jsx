import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Grid, Import, LayoutGrid, List, Plus, Search } from 'lucide-react'

import { templateService } from '../services/templateService'
import { useTemplateStore } from '../store/templateStore'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { TemplateCard } from '../components/templates/TemplateCard'
import { CreateTemplateModal } from '../components/templates/CreateTemplateModal'
import { UseTemplateModal } from '../components/templates/UseTemplateModal'
import { TemplatePreview } from '../components/templates/TemplatePreview'
import { Alert } from '../components/ui/Alert'

const categories = [
  'All Templates',
  'Contracts',
  'Legal Notices',
  'Petitions',
  'Memos',
  'Agreements',
  'Letters',
  'Affidavits',
]

const sampleTemplates = [
  { id: 'sale-agreement', name: 'Sale Agreement', category: 'Contracts', jurisdiction: 'All India', language: 'English', usageCount: 128, rating: 4.7, description: 'Comprehensive sale agreement template covering representations, warranties, and closing conditions.', updatedAt: new Date().toISOString() },
  { id: 'rental-agreement', name: 'Rental Agreement', category: 'Contracts', jurisdiction: 'Delhi', language: 'English', usageCount: 98, rating: 4.5, description: 'Residential rental agreement with clauses for security deposit, utilities, and termination.', updatedAt: new Date().toISOString() },
  { id: 'employment-contract', name: 'Employment Contract', category: 'Contracts', jurisdiction: 'All India', language: 'English', usageCount: 212, rating: 4.8, description: 'Employment contract template with probation, benefits, and confidentiality clauses.', updatedAt: new Date().toISOString() },
  { id: 'nda', name: 'Non-Disclosure Agreement (NDA)', category: 'Contracts', jurisdiction: 'All India', language: 'English', usageCount: 350, rating: 4.9, description: 'Mutual NDA covering definition of confidential information and obligations.', updatedAt: new Date().toISOString() },
  { id: 'power-of-attorney', name: 'Power of Attorney', category: 'Affidavits', jurisdiction: 'Maharashtra', language: 'English', usageCount: 77, rating: 4.6, description: 'General power of attorney format with customizable powers granted.', updatedAt: new Date().toISOString() },
  { id: 'legal-notice-breach', name: 'Legal Notice - Breach of Contract', category: 'Legal Notices', jurisdiction: 'Tamil Nadu', language: 'English', usageCount: 65, rating: 4.3, description: 'Notice template for breach of contract with demand for performance and damages.', updatedAt: new Date().toISOString() },
  { id: 'consumer-complaint', name: 'Consumer Complaint', category: 'Petitions', jurisdiction: 'All India', language: 'English', usageCount: 54, rating: 4.1, description: 'Draft consumer complaint before district forum including facts, relief sought, and annexures.', updatedAt: new Date().toISOString() },
  { id: 'divorce-petition', name: 'Divorce Petition', category: 'Petitions', jurisdiction: 'Karnataka', language: 'English', usageCount: 32, rating: 4.0, description: 'Petition under Hindu Marriage Act with annexures and jurisdiction details.', updatedAt: new Date().toISOString() },
  { id: 'bail-application', name: 'Bail Application', category: 'Petitions', jurisdiction: 'All India', language: 'English', usageCount: 43, rating: 4.2, description: 'Standard bail application referencing FIR, grounds for bail, and precedents.', updatedAt: new Date().toISOString() },
  { id: 'partnership-deed', name: 'Partnership Deed', category: 'Agreements', jurisdiction: 'All India', language: 'English', usageCount: 90, rating: 4.4, description: 'Partnership deed covering capital, profit sharing, duties, and dissolution.', updatedAt: new Date().toISOString() },
]

export default function Templates() {
  const queryClient = useQueryClient()
  const {
    templates,
    filters,
    pagination,
    view,
    setTemplates,
    setFilters,
    resetFilters,
    setView,
    setCurrentTemplate,
  } = useTemplateStore()

  const [searchInput, setSearchInput] = useState(filters.search)
  const [showCreate, setShowCreate] = useState(false)
  const [showUse, setShowUse] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [notice, setNotice] = useState(null)

  const { isFetching } = useQuery({
    queryKey: ['templates', filters, pagination.page, pagination.limit],
    queryFn: async () => {
      const response = await templateService.getTemplates(filters, pagination)
      const items = response.items ?? sampleTemplates
      setTemplates(items, {
        page: response.page ?? 1,
        limit: response.limit ?? 12,
        total: response.total ?? items.length,
      })
      return response
    },
  })

  const createMutation = useMutation({
    mutationFn: (payload) => templateService.createTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['templates'])
      setShowCreate(false)
      setNotice({ type: 'success', message: 'Template saved successfully.' })
    },
    onError: (error) => setNotice({ type: 'error', message: error.message || 'Unable to save template.' }),
  })

  const filtered = useMemo(() => {
    return templates.filter((template) => {
      if (filters.category && filters.category !== 'All Templates' && template.category !== filters.category) return false
      if (filters.jurisdiction && filters.jurisdiction !== 'All' && template.jurisdiction !== filters.jurisdiction) return false
      if (filters.language && filters.language !== 'All' && template.language !== filters.language) return false
      if (filters.rating && template.rating < filters.rating) return false
      if (filters.search && !template.name.toLowerCase().includes(filters.search.toLowerCase())) return false
      return true
    })
  }, [templates, filters])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    setFilters({ search: searchInput })
  }

  const handleUseTemplate = (template) => {
    setCurrentTemplate(template)
    setShowUse(true)
  }

  const handlePreviewTemplate = (template) => {
    setCurrentTemplate(template)
    setShowPreview(true)
  }

  const handleDuplicate = () => setNotice({ type: 'info', message: 'Template duplication coming soon.' })
  const handleDelete = () => setNotice({ type: 'info', message: 'Template archive flow coming soon.' })

  return (
    <div className="space-y-8">
      <PageHeader
        title="Document Templates"
        description="Centralise your legal drafting with reusable, AI-ready templates tailored to Indian practice."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" icon={Import}>
              Import template
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setShowCreate(true)}>
              Create template
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setFilters({ category })}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                filters.category === category ? 'border-blue-200 bg-blue-50 text-blue-600 shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant={view === 'grid' ? 'primary' : 'ghost'} size="sm" icon={LayoutGrid} onClick={() => setView('grid')}>
            Grid
          </Button>
          <Button variant={view === 'list' ? 'primary' : 'ghost'} size="sm" icon={List} onClick={() => setView('list')}>
            List
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search templates"
              className="w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-10 pr-3 text-sm text-slate-700 dark:text-slate-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20"
            />
          </form>
          <Badge variant="secondary" size="sm">
            {filtered.length} templates
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
          <span>Sort by</span>
          <select
            value={filters.sortBy || 'popularity'}
            onChange={(event) => setFilters({ sortBy: event.target.value })}
            className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1"
          >
            <option value="popularity">Most popular</option>
            <option value="recent">Recently added</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Filters</h3>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Jurisdiction</label>
            <select
              value={filters.jurisdiction}
              onChange={(event) => setFilters({ jurisdiction: event.target.value })}
              className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3"
            >
              <option value="All">All</option>
              <option value="All India">All India</option>
              <option value="Delhi">Delhi</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
            </select>
          </div>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Language</label>
            <select
              value={filters.language}
              onChange={(event) => setFilters({ language: event.target.value })}
              className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3"
            >
              <option value="All">All</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Marathi">Marathi</option>
            </select>
          </div>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Created by</label>
            <select
              value={filters.createdBy}
              onChange={(event) => setFilters({ createdBy: event.target.value })}
              className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3"
            >
              <option value="team">My team</option>
              <option value="me">Me</option>
              <option value="public">Public library</option>
            </select>
          </div>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Rating</label>
            <select
              value={filters.rating}
              onChange={(event) => setFilters({ rating: Number(event.target.value) })}
              className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3"
            >
              <option value={0}>All</option>
              <option value={4}>4+ stars</option>
              <option value={4.5}>4.5+ stars</option>
            </select>
          </div>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Reset filters
          </Button>
        </aside>

        <main className="space-y-4">
          {view === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  view="grid"
                  onUse={handleUseTemplate}
                  onPreview={handlePreviewTemplate}
                  onEdit={() => setShowCreate(true)}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  view="list"
                  onUse={handleUseTemplate}
                  onPreview={handlePreviewTemplate}
                  onEdit={() => setShowCreate(true)}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 p-10 text-center text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
              No templates found. Adjust filters or create a new template.
            </div>
          )}
        </main>
      </div>

      {isFetching && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-600 shadow-lg">
          <Grid className="h-4 w-4 animate-spin" />
          Refreshing templates…
        </div>
      )}

      <CreateTemplateModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSave={(payload) => createMutation.mutate(payload)}
      />

      {showUse && (
        <UseTemplateModal
          isOpen={showUse}
          onClose={() => setShowUse(false)}
          template={useTemplateStore.getState().currentTemplate}
          onGenerate={() => setNotice({ type: 'info', message: 'Document generation coming soon.' })}
          onPreview={() => setNotice({ type: 'info', message: 'Document preview coming soon.' })}
          onAIHelp={() => setNotice({ type: 'info', message: 'AI-assisted fill coming soon.' })}
        />
      )}

      {showPreview && (
        <Modal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title="Template preview"
          size="lg"
          footer={
            <Button variant="primary" onClick={() => handleUseTemplate(useTemplateStore.getState().currentTemplate)}>
              Use this template
            </Button>
          }
        >
          <TemplatePreview template={useTemplateStore.getState().currentTemplate} onUse={handleUseTemplate} />
        </Modal>
      )}
    </div>
  )
}

export { Templates }

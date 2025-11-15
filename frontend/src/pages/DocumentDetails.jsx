import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Bot,
  ChevronLeft,
  FileWarning,
  Loader2,
  MoreVertical,
  Share2,
  Sparkles,
  Trash2,
} from 'lucide-react'

import { documentService } from '../services/documentService'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Alert } from '../components/ui/Alert'
import { Modal } from '../components/ui/Modal'

import { DocumentViewer } from '../components/documents/DocumentViewer'
import { AnalysisPanel } from '../components/documents/AnalysisPanel'
import { DocumentMetadata } from '../components/documents/DocumentMetadata'
import { AskAboutDocumentModal } from '../components/documents/AskAboutDocumentModal'

const TABS = ['analysis', 'metadata', 'activity', 'related']

export default function DocumentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('analysis')
  const [showAskModal, setShowAskModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [analyzeError, setAnalyzeError] = useState(null)
  const [metadataToast, setMetadataToast] = useState(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['document', id],
    queryFn: () => documentService.getDocumentById(id),
    enabled: Boolean(id),
  })

  // Load questions separately to match backend routes
  const { data: questionsData, refetch: refetchQuestions } = useQuery({
    queryKey: ['document-questions', id],
    queryFn: () => documentService.getDocumentQuestions(id),
    enabled: Boolean(id),
  })

  const analyzeMutation = useMutation({
    mutationFn: () => documentService.analyzeDocument(id),
    onSuccess: (analysis) => {
      setAnalyzeError(null)
      // Optimistically update current document cache so UI shows results immediately
      queryClient.setQueryData(['document', id], (prev) => {
        if (!prev || !prev.document) return prev
        console.log('[DocumentDetails] analyze:onSuccess', { id, gotAnalysis: Boolean(analysis) })
        return { ...prev, document: { ...prev.document, analysis } }
      })
      // Also refetch to ensure server state matches
      queryClient.invalidateQueries(['document', id])
    },
    onError: (analysisError) => {
      console.error('[DocumentDetails] analyze:onError', analysisError)
      setAnalyzeError(analysisError.message || 'Unable to analyze document at this time.')
    },
  })

  const updateMetadataMutation = useMutation({
    mutationFn: (payload) => documentService.updateDocument(id, payload),
    onSuccess: () => {
      setMetadataToast({ type: 'success', message: 'Document metadata saved successfully.' })
      queryClient.invalidateQueries(['document', id])
    },
    onError: (updateError) => {
      setMetadataToast({ type: 'error', message: updateError.message || 'Failed to save metadata.' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => documentService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['documents'])
      navigate('/documents')
    },
  })

  const document = data?.document
  const questions = questionsData ?? []

  const documentFile = useMemo(() => {
    if (!document?.fileUrl) return null
    return document.fileUrl
  }, [document])

  const handleAnalyze = () => {
    console.log('[DocumentDetails] handleAnalyze called for', id)
    analyzeMutation.mutate()
  }
  const handleRegenerate = () => {
    console.log('[DocumentDetails] handleRegenerate called for', id)
    analyzeMutation.mutate()
  }
  const handleExport = (format) => {
    console.info('Export analysis as', format)
  }

  const handleMetadataSave = async (payload) => {
    await updateMetadataMutation.mutateAsync(payload)
  }

  const handleDownload = async () => {
    const blob = await documentService.downloadDocument(id)
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = document?.name || 'document.pdf'
    anchor.click()
    window.URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleAskQuestion = async (question) => {
    await documentService.askQuestion(id, question)
    await refetchQuestions()
  }

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
        <FileWarning className="h-10 w-10 text-rose-500" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Unable to load document</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">{error?.message || 'Please try again later.'}</p>
        <Button variant="primary" onClick={() => navigate('/documents')} icon={ChevronLeft}>
          Back to documents
        </Button>
      </div>
    )
  }

  const tabContent = {
    analysis: (
      <AnalysisPanel
        analysis={document?.analysis}
        loading={analyzeMutation.isPending}
        onAnalyze={handleAnalyze}
        onRegenerate={handleRegenerate}
        onExport={handleExport}
      />
    ),
    metadata: (
      <DocumentMetadata
        metadata={document?.metadata || {}}
        onSave={handleMetadataSave}
        saving={updateMetadataMutation.isLoading}
      />
    ),
    activity: <ActivityTimeline activity={document?.activity || []} />,
    related: <RelatedDocuments related={document?.related || []} similar={document?.similar || []} />,
  }

  const actionButtons = (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="ghost" size="sm" icon={Sparkles} onClick={() => setShowAskModal(true)}>
        Ask AI
      </Button>
      <Button variant="ghost" size="sm" icon={Share2}>
        Share
      </Button>
      <Button variant="ghost" size="sm" icon={Bot}>
        Move to matter
      </Button>
      <Button variant="danger" size="sm" icon={Trash2} onClick={() => setShowDeleteModal(true)}>
        Delete
      </Button>
    </div>
  )

  return (
    <div className="flex h-full flex-col gap-8">
      <PageHeader
        title={document?.name || 'Document'}
        description={document?.description || 'Comprehensive AI-powered insights, metadata, and activity for this document.'}
        breadcrumbs={
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
            <button type="button" onClick={() => navigate('/documents')} className="flex items-center gap-1 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 dark:text-slate-300">
              <ChevronLeft className="h-3 w-3" /> Documents
            </button>
            <span>·</span>
            <span className="truncate text-slate-400 dark:text-slate-500">{document?.name || id}</span>
          </div>
        }
        actions={actionButtons}
      />

      {analyzeError && (
        <Alert
          variant="error"
          title="Analysis failed"
          message={analyzeError}
          dismissible
          onClose={() => setAnalyzeError(null)}
        />
      )}

      {metadataToast && (
        <Alert
          variant={metadataToast.type === 'success' ? 'success' : 'error'}
          title={metadataToast.type === 'success' ? 'Saved' : 'Update failed'}
          message={metadataToast.message}
          dismissible
          onClose={() => setMetadataToast(null)}
        />
      )}

      {analyzeError && <Alert variant="error" title="Analysis failed" message={analyzeError} dismissible onClose={() => setAnalyzeError(null)} />}

      <div className="grid h-[calc(100vh-14rem)] gap-6 lg:grid-cols-[3fr_2fr]">
        <DocumentViewer file={documentFile} filename={document?.name} onDownload={handleDownload} onPrint={handlePrint} />

        <div className="flex h-full flex-col rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
          <nav className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500">
            <div className="flex flex-wrap items-center gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 capitalize transition ${activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button type="button" className="rounded-full border border-slate-200 dark:border-slate-700 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 dark:text-slate-300">
              <MoreVertical className="h-4 w-4" />
            </button>
          </nav>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {tabContent[activeTab]}
          </div>

          <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-6 py-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">Quick actions</h4>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="primary" icon={Sparkles} onClick={() => setShowAskModal(true)}>
                Ask AI
              </Button>
              <Button size="sm" variant="secondary" icon={Share2}>
                Share
              </Button>
              <Button size="sm" variant="ghost" icon={Bot}>
                Move to matter
              </Button>
              <Button size="sm" variant="danger" icon={Trash2} onClick={() => setShowDeleteModal(true)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AskAboutDocumentModal isOpen={showAskModal} onClose={() => setShowAskModal(false)} onSubmit={handleAskQuestion} history={questions} />

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete document"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleteMutation.isLoading} onClick={() => deleteMutation.mutate()}>
              Delete document
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This action permanently removes the document and its AI analysis from YourCase. You can re-upload the file later but previous insights will be lost.
        </p>
      </Modal>
    </div>
  )
}

function ActivityTimeline({ activity }) {
  if (!activity || activity.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-6 text-center text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
        No activity recorded yet.
      </div>
    )
  }

  return (
    <ol className="relative space-y-4 border-l border-slate-200 dark:border-slate-700 pl-4">
      {activity.map((item) => (
        <li key={item.id} className="ml-4">
          <span className="absolute -left-2 mt-1 h-3 w-3 rounded-full border border-blue-500 bg-blue-100" />
          <p className="text-xs font-medium uppercase tracking-wide text-blue-600">{item.action}</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.user?.name || 'System'}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
          {item.note && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.note}</p>}
        </li>
      ))}
    </ol>
  )
}

ActivityTimeline.propTypes = {}

function RelatedDocuments({ related, similar }) {
  if ((related?.length ?? 0) === 0 && (similar?.length ?? 0) === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-6 text-center text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
        No related documents yet. Upload more matter files to see connections.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {related?.length > 0 && (
        <section>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Same matter</h4>
          <ul className="mt-2 space-y-2">
            {related.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{item.type}</p>
                </div>
                <Badge variant="secondary" size="sm">
                  {item.status}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      )}

      {similar?.length > 0 && (
        <section>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Similar documents</h4>
          <ul className="mt-2 space-y-2">
            {similar.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{item.matches?.join(', ')}</p>
                </div>
                <Badge variant="primary" size="sm">
                  {Math.round((item.similarity ?? 0) * 100)}% match
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

RelatedDocuments.propTypes = {}

export { DocumentDetails }

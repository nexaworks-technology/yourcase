import { useState, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useDropzone } from 'react-dropzone'
import { Loader2, Upload, X, Info } from 'lucide-react'
import { documentService } from '../../services/documentService'
import { cn } from '../../utils/cn'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'text/plain': 'TXT',
}

const MATTER_PLACEHOLDER = '__no_matter__'

const prepareMetadata = (raw = {}) => {
  const payload = {}

  const matterValue = raw.matter?.value || raw.matter
  if (matterValue && matterValue !== MATTER_PLACEHOLDER) {
    payload.matterId = matterValue
  }

  const typeValue = raw.type?.value || raw.type
  if (typeValue) {
    payload.documentType = typeValue
  }

  if (raw.tags) {
    const tags = Array.isArray(raw.tags)
      ? raw.tags
      : String(raw.tags)
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)

    if (tags.length) {
      payload.tags = tags
    }
  }

  if (raw.description) {
    payload.metadata = { notes: raw.description }
  }

  return payload
}

export function DocumentUpload({ onSuccess, matters, documentTypes }) {
  const [queue, setQueue] = useState([])
  const [errors, setErrors] = useState([])
  const [metadataModal, setMetadataModal] = useState({ open: false, file: null })
  const [metadata, setMetadata] = useState({ matter: MATTER_PLACEHOLDER, type: 'other', tags: '', description: '' })

  const matterOptions = useMemo(
    () => [{ value: MATTER_PLACEHOLDER, label: 'No matter' }, ...matters],
    [matters],
  )

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      const nextErrors = rejectedFiles.map((file) => ({
        name: file.file.name,
        message: file.errors.map((error) => error.message).join(', '),
      }))

      const mapped = acceptedFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: 'pending',
        metadata,
      }))

      setQueue((prev) => [...prev, ...mapped])
      if (nextErrors.length) setErrors((prev) => [...prev, ...nextErrors])
      if (mapped.length && !metadataModal.open) {
        setMetadataModal({ open: true, file: mapped[0] })
      }
    },
    [metadata, metadataModal.open],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.fromEntries(Object.keys(ACCEPTED_TYPES).map((type) => [type, []])),
    maxSize: MAX_SIZE,
  })

  const startUpload = async (item, overrides = {}) => {
    setQueue((prev) => prev.map((queueItem) => (queueItem.id === item.id ? { ...queueItem, status: 'uploading' } : queueItem)))
    try {
      const response = await documentService.uploadDocument(
        item.file,
        prepareMetadata({ ...item.metadata, ...overrides }),
        (progress) => {
          setQueue((prev) =>
            prev.map((queueItem) => (queueItem.id === item.id ? { ...queueItem, progress } : queueItem)),
          )
        },
      )
      setQueue((prev) => prev.filter((queueItem) => queueItem.id !== item.id))
      onSuccess?.(response)
    } catch (error) {
      console.error(error)
      setQueue((prev) => prev.map((queueItem) => (queueItem.id === item.id ? { ...queueItem, status: 'error' } : queueItem)))
      setErrors((prev) => [...prev, { name: item.file.name, message: error.message }])
    }
  }

  const cancelUpload = (id) => {
    setQueue((prev) => prev.filter((item) => item.id !== id))
  }

  const handleMetadataSubmit = (event) => {
    event.preventDefault()
    if (!metadataModal.file) return

    const fileItem = metadataModal.file
    setQueue((prev) => prev.map((item) => (item.id === fileItem.id ? { ...item, metadata } : item)))
    setMetadataModal({ open: false, file: null })
    startUpload(fileItem, metadata)
  }

  return (
    <div className="space-y-6">
      <div
        {...getRootProps({
          className: cn(
            'cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 p-10 text-center transition hover:border-blue-400 hover:bg-blue-50',
            isDragActive && 'border-blue-500 bg-blue-50',
          ),
        })}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-10 w-10 text-blue-500" />
        <div className="mt-4 space-y-2">
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">Drag files here or click to browse</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">Accepted formats: PDF, DOCX, TXT · Max size 10MB · Multiple uploads supported</p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="space-y-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <h4 className="font-semibold">Upload errors</h4>
          <ul className="list-disc pl-5">
            {errors.map((error) => (
              <li key={`${error.name}-${error.message}`}>
                {error.name}: {error.message}
              </li>
            ))}
          </ul>
          <button type="button" className="text-xs text-rose-600 hover:text-rose-700" onClick={() => setErrors([])}>
            Clear errors
          </button>
        </div>
      )}

      {queue.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300">Upload queue</h4>
          <div className="space-y-2">
            {queue.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.file.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                      {(item.file.size / (1024 * 1024)).toFixed(2)} MB · {ACCEPTED_TYPES[item.file.type] || item.file.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === 'uploading' && (
                      <span className="inline-flex items-center gap-2 text-sm text-blue-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading {item.progress}%
                      </span>
                    )}
                    {item.status === 'error' && <span className="text-sm text-rose-600">Upload failed</span>}
                    <button
                      type="button"
                      onClick={() => cancelUpload(item.id)}
                      className="rounded-full border border-slate-200 dark:border-slate-700 p-1 text-slate-500 dark:text-slate-400 dark:text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800"
                      aria-label="Cancel upload"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {metadataModal.open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Document metadata</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">Add context to help YourCase organize your files</p>
              </div>
              <button type="button" onClick={() => setMetadataModal({ open: false, file: null })} className="rounded-full border border-slate-200 dark:border-slate-700 p-1 text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleMetadataSubmit}>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500">
                Matter
                <select
                  value={metadata.matter}
                  onChange={(event) => setMetadata((prev) => ({ ...prev, matter: event.target.value }))}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20"
                >
                  {matterOptions.map((matter) => (
                    <option key={matter.value} value={matter.value}>
                      {matter.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500">
                Document type
                <select
                  value={metadata.type}
                  onChange={(event) => setMetadata((prev) => ({ ...prev, type: event.target.value }))}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20"
                  required
                >
                  {documentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500">
                Tags (comma separated)
                <input
                  type="text"
                  value={metadata.tags}
                  onChange={(event) => setMetadata((prev) => ({ ...prev, tags: event.target.value }))}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20"
                  placeholder="Funding, diligence, contract"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500">
                Description
                <textarea
                  value={metadata.description}
                  onChange={(event) => setMetadata((prev) => ({ ...prev, description: event.target.value }))}
                  className="min-h-[120px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20"
                  placeholder="Add context for the AI assistant"
                />
              </label>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-900 px-4 py-3 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  Context helps the assistant generate better summaries and analysis.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setMetadataModal({ open: false, file: null })} className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                  Save & upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

DocumentUpload.propTypes = {
  onSuccess: PropTypes.func,
  matters: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, label: PropTypes.string })),
  documentTypes: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, label: PropTypes.string })),
}

DocumentUpload.defaultProps = {
  onSuccess: undefined,
  matters: [],
  documentTypes: [],
}

export default DocumentUpload

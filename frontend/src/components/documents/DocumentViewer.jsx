import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import { API_BASE_URL } from '../../services/api'
import {
  Expand,
  FileText,
  Loader2,
  Minus,
  Maximize,
  Minimize,
  Plus,
  Printer,
  RotateCcw,
  RotateCw,
  Search,
  Download,
} from 'lucide-react'
import screenfull from 'screenfull'

import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { cn } from '../../utils/cn'

// Fix worker fetch by pointing to npm-installed worker bundled with vite
// react-pdf v10 uses pdfjs-dist. Import the worker directly so Vite bundles it.
// eslint-disable-next-line import/no-duplicates
// Use Vite asset URL for the worker so it bundles correctly
// pdfjs >=5 provides an ESM worker at this path
// Vite will turn this into a hashed asset URL at build time
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

const zoomSteps = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

export function DocumentViewer({
  file,
  filename,
  onDownload,
  onPrint,
  annotationsEnabled = false,
}) {
  const containerRef = useRef(null)
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMatches, setSearchMatches] = useState([])
  const [searchIndex, setSearchIndex] = useState(0)

  const handleDocumentLoadSuccess = ({ numPages: nextNumPages }) => {
    setNumPages(nextNumPages)
    setPageNumber(1)
  }

  const handlePageChange = (nextPage) => {
    if (!numPages) return
    const clamped = Math.min(Math.max(nextPage, 1), numPages)
    setPageNumber(clamped)
  }

  const stepZoom = (direction) => {
    const currentIndex = zoomSteps.findIndex((value) => value >= scale - 0.001 && value <= scale + 0.001)
    if (direction === 'in') {
      const next = zoomSteps[Math.min(currentIndex + 1, zoomSteps.length - 1)]
      setScale(next)
    } else {
      const next = zoomSteps[Math.max(currentIndex - 1, 0)]
      setScale(next)
    }
  }

  const handleFullScreenToggle = () => {
    if (!containerRef.current || !screenfull.isEnabled) return
    if (screenfull.isFullscreen) {
      screenfull.exit()
    } else {
      screenfull.request(containerRef.current)
    }
  }

  useEffect(() => {
    if (!screenfull.isEnabled) return undefined

    const handleChange = () => setIsFullScreen(screenfull.isFullscreen)
    screenfull.on('change', handleChange)
    return () => {
      screenfull.off('change', handleChange)
    }
  }, [])

  const handleSearch = useCallback(
    (event) => {
      event.preventDefault()
      if (!searchQuery) {
        setSearchMatches([])
        setSearchIndex(0)
        return
      }

      // Basic search heuristic: navigate page-by-page; real text-layer search would hook into pdfjs text content
      const next = []
      for (let i = 1; i <= (numPages || 0); i += 1) next.push({ page: i })
      setSearchMatches(next)
      setSearchIndex(0)
      if (next.length > 0) setPageNumber(next[0].page)
    },
    [searchQuery, numPages],
  )

  const handleSearchNavigate = (direction) => {
    if (!searchMatches.length) return
    const nextIndex = (searchIndex + direction + searchMatches.length) % searchMatches.length
    setSearchIndex(nextIndex)
    setPageNumber(searchMatches[nextIndex].page)
  }

  const pageThumbnails = useMemo(() => {
    if (!numPages) return []
    return Array.from({ length: numPages }, (_, index) => index + 1)
  }, [numPages])

  // Normalize file source: if it looks like a relative /uploads path, prefix API_BASE_URL
  const fileSrc = useMemo(() => {
    if (!file) return null
    if (typeof file === 'string') {
      if (file.startsWith('/uploads/')) return `${API_BASE_URL}${file}`
      return file
    }
    return file
  }, [file])

  return (
    <div ref={containerRef} className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-slate-900">{filename}</h2>
          <p className="text-xs text-slate-500">Interactive preview · {numPages ? `${numPages} pages` : 'Loading…'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" icon={Printer} onClick={onPrint}>
            Print
          </Button>
          <Button variant="ghost" size="sm" icon={Download} onClick={onDownload}>
            Download
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={isFullScreen ? Minimize : Maximize}
            onClick={handleFullScreenToggle}
          >
            {isFullScreen ? 'Exit full screen' : 'Full screen'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-20 shrink-0 border-r border-slate-100 bg-slate-50 p-3 md:block">
          <div className="space-y-2">
            {pageThumbnails.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setPageNumber(page)}
                className={cn(
                  'flex h-16 w-full items-center justify-center rounded-xl border border-transparent bg-white text-xs text-slate-500 shadow-sm transition hover:border-blue-200 hover:bg-blue-50',
                  pageNumber === page && 'border-blue-300 bg-blue-50 text-blue-600 shadow-md',
                )}
              >
                <FileText className="h-5 w-5" />
                <span className="mt-1 text-[10px] font-medium">Page {page}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 overflow-auto bg-slate-50">
          <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-6 py-3 backdrop-blur">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" icon={Minus} onClick={() => stepZoom('out')}>
                Zoom out
              </Button>
              <span className="min-w-[3rem] text-center text-sm font-medium text-slate-500">{Math.round(scale * 100)}%</span>
              <Button variant="ghost" size="sm" icon={Plus} onClick={() => stepZoom('in')}>
                Zoom in
              </Button>
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-3 py-1 text-sm text-slate-500 transition hover:bg-slate-100"
                onClick={() => setScale(1)}
              >
                Reset
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100"
                onClick={() => setRotation((value) => (value + 90) % 360)}
              >
                <RotateCw className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100"
                onClick={() => setRotation((value) => (value - 90 + 360) % 360)}
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSearch} className="relative flex items-center gap-2">
              <Search className="absolute left-3 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search document"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-64 pl-9"
              />
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <span>
                  {searchMatches.length > 0 ? searchIndex + 1 : 0}/{searchMatches.length}
                </span>
                <button
                  type="button"
                  onClick={() => handleSearchNavigate(-1)}
                  className="rounded border border-slate-200 px-1 py-0.5 hover:bg-slate-100"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => handleSearchNavigate(1)}
                  className="rounded border border-slate-200 px-1 py-0.5 hover:bg-slate-100"
                >
                  ↓
                </button>
              </div>
            </form>
          </div>

          <div className="flex flex-col items-center gap-6 p-6">
            <Document file={fileSrc} onLoadSuccess={handleDocumentLoadSuccess} loading={<ViewerSkeleton />} error={<ViewerError />}>
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                renderAnnotationLayer={annotationsEnabled}
                renderTextLayer
                className="rounded-2xl shadow-lg"
              />
            </Document>
            {numPages && (
              <div className="flex items-center gap-4 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm text-slate-600 shadow-md">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1 hover:bg-slate-100"
                  onClick={() => handlePageChange(pageNumber - 1)}
                  disabled={pageNumber <= 1}
                >
                  Prev
                </button>
                <span className="font-medium">
                  Page {pageNumber} <span className="text-slate-400">of</span> {numPages}
                </span>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1 hover:bg-slate-100"
                  onClick={() => handlePageChange(pageNumber + 1)}
                  disabled={pageNumber >= numPages}
                >
                  Next
                </button>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={numPages}
                    value={pageNumber}
                    onChange={(event) => handlePageChange(Number(event.target.value))}
                    className="h-9 w-16 rounded-lg border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400">Jump to</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ViewerSkeleton() {
  return (
    <div className="flex h-96 w-full max-w-3xl items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-100 animate-pulse">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>
  )
}

function ViewerError() {
  return (
    <div className="flex h-96 w-full max-w-3xl flex-col items-center justify-center rounded-3xl border border-rose-200 bg-rose-50 text-rose-600">
      <p className="text-sm font-semibold">Unable to load document preview</p>
      <p className="text-xs text-rose-500">Try downloading the file to view locally.</p>
    </div>
  )
}

DocumentViewer.propTypes = {
  file: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(File), PropTypes.instanceOf(ArrayBuffer), PropTypes.object]),
  filename: PropTypes.string,
  onDownload: PropTypes.func,
  onPrint: PropTypes.func,
  annotationsEnabled: PropTypes.bool,
}

DocumentViewer.defaultProps = {
  file: null,
  filename: 'Document.pdf',
  onDownload: undefined,
  onPrint: undefined,
  annotationsEnabled: false,
}

export default DocumentViewer

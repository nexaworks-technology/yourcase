import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const defaultFilters = {
  matter: null,
  types: [],
  status: 'all',
  dateRange: null,
  search: '',
  sortBy: 'date',
  sortOrder: 'desc',
}

export const useDocumentStore = create(
  persist(
    (set, get) => ({
      documents: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
      },
      filters: defaultFilters,
      selectedDocuments: new Set(),
      view: 'grid',
      uploading: [],
      setDocuments(documents, pagination) {
        set({ documents, pagination: { ...get().pagination, ...pagination } })
      },
      appendDocuments(newDocuments, pagination) {
        set((state) => ({
          documents: [...state.documents, ...newDocuments],
          pagination: { ...state.pagination, ...pagination },
        }))
      },
      setFilters(nextFilters) {
        set({ filters: { ...get().filters, ...nextFilters } })
      },
      resetFilters() {
        set({ filters: defaultFilters })
      },
      toggleView() {
        set((state) => ({ view: state.view === 'grid' ? 'list' : 'grid' }))
      },
      setView(view) {
        set({ view })
      },
      selectDocument(id) {
        set((state) => {
          const next = new Set(state.selectedDocuments)
          if (next.has(id)) {
            next.delete(id)
          } else {
            next.add(id)
          }
          return { selectedDocuments: next }
        })
      },
      selectAll(ids) {
        set({ selectedDocuments: new Set(ids) })
      },
      clearSelection() {
        set({ selectedDocuments: new Set() })
      },
      addUploading(item) {
        set((state) => ({ uploading: [...state.uploading, item] }))
      },
      updateUploading(id, patch) {
        set((state) => ({
          uploading: state.uploading.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        }))
      },
      removeUploading(id) {
        set((state) => ({ uploading: state.uploading.filter((item) => item.id !== id) }))
      },
    }),
    {
      name: 'document-store',
      partialize: (state) => ({ view: state.view, filters: state.filters }),
      version: 1,
    },
  ),
)

export default useDocumentStore

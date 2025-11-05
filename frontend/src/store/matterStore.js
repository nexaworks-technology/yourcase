import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const defaultFilters = {
  status: 'all',
  types: [],
  priorities: [],
  lawyers: [],
  dateRange: null,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  search: '',
}

export const useMatterStore = create(
  persist(
    (set, get) => ({
      matters: [],
      stats: {
        total: 0,
        active: 0,
        closingSoon: 0,
        overdue: 0,
      },
      filters: defaultFilters,
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
      },
      view: 'card',
      selectedIds: new Set(),
      selectedMatter: null,

      setMatters(matters, pagination = {}) {
        set({
          matters,
          pagination: { ...get().pagination, ...pagination },
        })
      },

      addMatter(matter) {
        set((state) => ({ matters: [matter, ...state.matters] }))
      },

      updateMatter(id, payload) {
        set((state) => ({
          matters: state.matters.map((item) => (item.id === id || item._id === id ? { ...item, ...payload } : item)),
        }))
      },

      removeMatter(id) {
        set((state) => ({ matters: state.matters.filter((item) => item.id !== id && item._id !== id) }))
      },

      setStats(stats) {
        set({ stats: { ...get().stats, ...stats } })
      },

      setFilters(next) {
        set({ filters: { ...get().filters, ...next } })
      },

      resetFilters() {
        set({ filters: defaultFilters })
      },

      setPagination(pagination) {
        set({ pagination: { ...get().pagination, ...pagination } })
      },

      setView(view) {
        set({ view })
      },

      setSelected(ids = []) {
        set({ selectedIds: new Set(ids) })
      },

      toggleSelection(id) {
        set((state) => {
          const next = new Set(state.selectedIds)
          if (next.has(id)) next.delete(id)
          else next.add(id)
          return { selectedIds: next }
        })
      },

      clearSelection() {
        set({ selectedIds: new Set() })
      },

      setSelectedMatter(matter) {
        set({ selectedMatter: matter })
      },
    }),
    {
      name: 'matter-store',
      partialize: (state) => ({ filters: state.filters, view: state.view }),
      version: 1,
    },
  ),
)

export default useMatterStore

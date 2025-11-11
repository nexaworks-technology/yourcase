import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const defaultFilters = {
  category: 'All Templates',
  jurisdiction: 'All',
  language: 'All',
  createdBy: 'team',
  rating: 0,
  search: '',
}

export const useTemplateStore = create(
  persist(
    (set, get) => ({
      templates: [],
      filters: defaultFilters,
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
      },
      view: 'grid',
      categories: [],
      currentTemplate: null,
      generatedDocs: [],

      setTemplates(templates, pagination = {}) {
        set({
          templates,
          pagination: { ...get().pagination, ...pagination },
        })
      },

      setFilters(next) {
        set({ filters: { ...get().filters, ...next } })
      },

      resetFilters() {
        set({ filters: defaultFilters })
      },

      setView(view) {
        set({ view })
      },

      setCurrentTemplate(template) {
        set({ currentTemplate: template })
      },

      addGeneratedDoc(doc) {
        set((state) => ({ generatedDocs: [doc, ...state.generatedDocs] }))
      },
    }),
    {
      name: 'template-store',
      partialize: (state) => ({ filters: state.filters, view: state.view }),
      version: 1,
    },
  ),
)

export default useTemplateStore

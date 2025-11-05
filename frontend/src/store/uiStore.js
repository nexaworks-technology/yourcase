import { create } from 'zustand'

export const useUiStore = create((set) => ({
  sidebarOpen: true,
  modalOpen: false,
  currentModal: null,
  notifications: [],

  toggleSidebar() {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }))
  },

  setSidebarOpen(isOpen) {
    set({ sidebarOpen: isOpen })
  },

  openModal(modalName) {
    set({ modalOpen: true, currentModal: modalName })
  },

  closeModal() {
    set({ modalOpen: false, currentModal: null })
  },

  addNotification(notification) {
    set((state) => ({ notifications: [...state.notifications, notification] }))
  },

  removeNotification(id) {
    set((state) => ({ notifications: state.notifications.filter((item) => item.id !== id) }))
  },

  clearNotifications() {
    set({ notifications: [] })
  },
}))

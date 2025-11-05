import { useMemo } from 'react'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const store = useAuthStore()
  const { user } = store

  const roleHelpers = useMemo(
    () => ({
      isAdmin: () => user?.role === 'admin',
      isLawyer: () => user?.role === 'lawyer',
      isParalegal: () => user?.role === 'paralegal',
      isClient: () => user?.role === 'client',
    }),
    [user?.role],
  )

  return {
    ...store,
    ...roleHelpers,
  }
}

/*
Example usage:
const { user, login, isAuthenticated, isAdmin } = useAuth()
*/

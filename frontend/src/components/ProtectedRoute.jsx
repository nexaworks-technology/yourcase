import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useAuth } from '../hooks/useAuth'
import { Spinner } from './ui/Spinner'
import { Alert } from './ui/Alert'

export function ProtectedRoute({ roles }) {
  const location = useLocation()
  const { isAuthenticated, user, isLoading, loadUser, logout } = useAuth()
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const verify = async () => {
      try {
        await loadUser()
      } catch (err) {
        setError(err?.message || 'Session expired')
      } finally {
        if (isMounted) setChecking(false)
      }
    }

    if (!isAuthenticated) {
      verify()
    } else {
      setChecking(false)
    }

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, loadUser])

  if (isLoading || checking) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Spinner variant="circle" size="lg" />
        <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">Verifying your session…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (error) {
      logout()
    }
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (user?.status === 'disabled') {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-center shadow-sm">
        <Alert variant="warning" title="Account disabled" message="Please contact your administrator for access." />
      </div>
    )
  }

  if (user?.subscriptionStatus === 'expired') {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-center shadow-sm">
        <Alert
          variant="warning"
          title="Subscription expired"
          message="Upgrade your plan to continue using AI workflows and secure storage."
        />
      </div>
    )
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}

ProtectedRoute.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string),
}

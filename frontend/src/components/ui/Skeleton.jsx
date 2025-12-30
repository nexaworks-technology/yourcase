import PropTypes from 'prop-types'

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 ${className}`} aria-hidden="true" />
  )
}

export function SkeletonRow({ className = '' }) {
  return (
    <div className={`animate-pulse h-4 rounded bg-slate-200 dark:bg-slate-800 ${className}`} aria-hidden="true" />
  )
}

export function SkeletonPanel({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 ${className}`} aria-hidden="true" />
  )
}

SkeletonCard.propTypes = { className: PropTypes.string }
SkeletonRow.propTypes = { className: PropTypes.string }
SkeletonPanel.propTypes = { className: PropTypes.string }

export default { SkeletonCard, SkeletonRow, SkeletonPanel }


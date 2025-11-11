import PropTypes from 'prop-types'
import { cn } from '../../utils/cn'
import { Skeleton } from '../ui/Skeleton'

const colorMap = {
  primary: 'from-blue-600/90 to-blue-700',
  secondary: 'from-indigo-500/80 to-indigo-600',
  success: 'from-emerald-500/90 to-emerald-600',
  warning: 'from-amber-500/90 to-amber-600',
  danger: 'from-rose-500/90 to-rose-600',
}

export function StatCard({ title, value, icon: Icon, trend, color = 'primary', loading, footer, className }) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
        <Skeleton variant="text" width="40%" className="mb-4" />
        <Skeleton variant="text" width="60%" height={36} />
        <Skeleton variant="text" width="50%" className="mt-6" />
      </div>
    )
  }

  return (
    <div className={cn('group flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</p>
          <h3 className="mt-3 text-3xl font-semibold text-slate-900">{value}</h3>
        </div>
        {Icon && (
          <span className={cn('rounded-2xl bg-gradient-to-br p-3 text-white shadow-md', colorMap[color] || colorMap.primary)}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>

      {trend && (
        <div className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className={cn('flex items-center gap-1', trend.direction === 'up' ? 'text-emerald-600' : 'text-rose-500')}>
            {trend.direction === 'up' ? '▲' : '▼'} {trend.value}
          </span>
          <span>{trend.caption}</span>
        </div>
      )}

      {footer && <div className="mt-5 text-xs text-slate-400">{footer}</div>}
    </div>
  )
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType,
  trend: PropTypes.shape({
    direction: PropTypes.oneOf(['up', 'down']),
    value: PropTypes.string,
    caption: PropTypes.string,
  }),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'danger']),
  loading: PropTypes.bool,
  footer: PropTypes.node,
  className: PropTypes.string,
}

/*
Example usage:
<StatCard
  title="Total queries"
  value="1,248"
  icon={Sparkles}
  color="primary"
  trend={{ direction: 'up', value: '+12%', caption: 'vs last week' }}
/>
*/

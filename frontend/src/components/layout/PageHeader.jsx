import PropTypes from 'prop-types'
import { cn } from '../../utils/cn'

export function PageHeader({ title, description, breadcrumbs, actions, className }) {
  return (
    <header className={cn('mb-10 flex flex-col gap-4 border-b border-slate-200 dark:border-slate-700/50 pb-6 lg:flex-row lg:items-center lg:justify-between', className)}>
      <div className="space-y-2">
        {breadcrumbs && <nav className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">{breadcrumbs}</nav>}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">{title}</h1>
          {description && <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  )
}

PageHeader.propTypes = {
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  breadcrumbs: PropTypes.node,
  actions: PropTypes.node,
  className: PropTypes.string,
}

/*
<PageHeader
  title="AI Assistant"
  description="Natural language interface for all your matters."
  breadcrumbs={<Breadcrumbs />}
  actions={<Button>New session</Button>}
/>
*/

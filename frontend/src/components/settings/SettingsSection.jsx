import PropTypes from 'prop-types'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'

export function SettingsSection({ id, title, description, children, onSave, saving, className }) {
  return (
    <section id={id} className={cn('space-y-6 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900', className)}>
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 dark:text-slate-100">{title}</h2>
        {description && <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">{description}</p>}
      </header>
      <div className="space-y-4">{children}</div>
      {onSave && (
        <div className="flex justify-end">
          <Button variant="primary" onClick={onSave} loading={saving}>
            Save changes
          </Button>
        </div>
      )}
    </section>
  )
}

SettingsSection.propTypes = {
  id: PropTypes.string,
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  children: PropTypes.node,
  onSave: PropTypes.func,
  saving: PropTypes.bool,
  className: PropTypes.string,
}

SettingsSection.defaultProps = {
  id: undefined,
  description: undefined,
  children: null,
  onSave: undefined,
  saving: false,
  className: undefined,
}

export default SettingsSection

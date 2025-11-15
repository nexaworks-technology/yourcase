import PropTypes from 'prop-types'
import { Switch } from '../ui/Switch'

export function NotificationToggles({ groups, onChange }) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.title} className="space-y-3">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{group.title}</h4>
            {group.description && <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{group.description}</p>}
          </div>
          <div className="space-y-2">
            {group.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 shadow-sm">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{item.label}</p>
                  {item.description && <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{item.description}</p>}
                </div>
                <Switch checked={item.enabled} onCheckedChange={(value) => onChange(item.id, value)} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

NotificationToggles.propTypes = {
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
          description: PropTypes.string,
          enabled: PropTypes.bool,
        }),
      ).isRequired,
    }),
  ).isRequired,
  onChange: PropTypes.func.isRequired,
}

export default NotificationToggles

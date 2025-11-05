import PropTypes from 'prop-types'
import { cn } from '../../utils/cn'

export function TabGroup({ tabs, activeTab, onChange, className, size = 'md' }) {
  return (
    <div
      className={cn(
        'flex w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 text-sm text-slate-600 shadow-sm',
        className,
      )}
    >
      {tabs.map((tab) => {
        const value = typeof tab === 'string' ? tab : tab.value
        const label = typeof tab === 'string' ? tab : tab.label
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange?.(value)}
            className={cn(
              'whitespace-nowrap rounded-xl px-4 py-2 transition',
              size === 'sm' && 'px-3 py-1.5 text-xs',
              size === 'lg' && 'px-5 py-2.5 text-base',
              activeTab === value ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-100',
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

TabGroup.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.node.isRequired,
      }),
    ]),
  ).isRequired,
  activeTab: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
}

TabGroup.defaultProps = {
  onChange: undefined,
  className: undefined,
  size: 'md',
}

export default TabGroup

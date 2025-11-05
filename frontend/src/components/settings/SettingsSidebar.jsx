import PropTypes from 'prop-types'
import { LayoutList, Shield, Bell, Sliders, CreditCard, Users, Puzzle, KeyRound, Info, User } from 'lucide-react'
import { cn } from '../../utils/cn'

const items = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: LayoutList },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'preferences', label: 'Preferences', icon: Sliders },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'integrations', label: 'Integrations', icon: Puzzle },
  { id: 'api', label: 'API Keys', icon: KeyRound },
  { id: 'about', label: 'About', icon: Info },
]

export function SettingsSidebar({ active, onChange }) {
  return (
    <nav className="h-full space-y-2">
      {items.map(({ id, label, icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
            active === id
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100',
          )}
        >
          {icon({ className: 'h-4 w-4' })}
          {label}
        </button>
      ))}
    </nav>
  )
}

SettingsSidebar.propTypes = {
  active: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default SettingsSidebar

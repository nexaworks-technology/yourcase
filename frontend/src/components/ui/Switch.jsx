import * as SwitchPrimitive from '@radix-ui/react-switch'
import PropTypes from 'prop-types'
import { cn } from '../../utils/cn'

export function Switch({ checked, onCheckedChange, className }) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        'relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full border border-transparent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        checked ? 'bg-blue-600' : 'bg-slate-300',
        className,
      )}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'pointer-events-none block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition',
          checked ? 'translate-x-5' : 'translate-x-1',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

Switch.propTypes = {
  checked: PropTypes.bool,
  onCheckedChange: PropTypes.func,
  className: PropTypes.string,
}

Switch.defaultProps = {
  checked: false,
  onCheckedChange: undefined,
  className: undefined,
}

export default Switch

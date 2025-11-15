import { Fragment, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { createPortal } from 'react-dom'
import { ChevronRight, Search } from 'lucide-react'
import { cn } from '../../utils/cn'

const positionMap = {
  'bottom-left': 'origin-top-left left-0 top-full mt-2',
  'bottom-right': 'origin-top-right right-0 top-full mt-2',
  'top-left': 'origin-bottom-left left-0 bottom-full mb-2',
  'top-right': 'origin-bottom-right right-0 bottom-full mb-2',
}

function DropdownMenu({ anchorRef, isOpen, onClose, items, position, className, searchable, onSelect }) {
  const menuRef = useRef(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target) && !anchorRef.current.contains(event.target)) {
        onClose()
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose, anchorRef])

  if (!isOpen) return null

  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true
    return item.label?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const menu = (
    <div
      ref={menuRef}
      className={cn(
        'absolute z-[120] min-w-[200px] rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl transition-all duration-150',
        positionMap[position] || positionMap['bottom-left'],
        className,
      )}
    >
      {searchable && (
        <div className="mb-2 flex items-center gap-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2">
          <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full border-none bg-transparent text-sm text-slate-800 dark:text-slate-200 outline-none"
          />
        </div>
      )}
      <div className="max-h-72 overflow-y-auto">
        {filteredItems.map((item, index) => {
          if (item.divider) {
            return <div key={`divider-${index}`} className="my-2 border-t border-slate-100 dark:border-slate-800" />
          }

          if (item.children) {
            return (
              <div key={item.label} className="relative">
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 transition hover:bg-blue-50"
                >
                  <span>{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                </button>
                <DropdownMenu
                  anchorRef={{ current: menuRef.current }}
                  isOpen={true}
                  onClose={onClose}
                  items={item.children}
                  position="top-right"
                />
              </div>
            )
          }

          return (
            <button
              key={item.value || item.label || index}
              type="button"
              onClick={() => {
                if (item.disabled) return
                item.onClick?.(item)
                onSelect?.(item)
                onClose()
              }}
              disabled={item.disabled}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition',
                item.disabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-blue-50 focus:bg-blue-100',
              )}
            >
              {item.icon && <item.icon className="h-4 w-4" aria-hidden="true" />}
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )

  return createPortal(menu, document.body)
}

DropdownMenu.propTypes = {
  anchorRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  items: PropTypes.arrayOf(PropTypes.object),
  position: PropTypes.oneOf(['bottom-left', 'bottom-right', 'top-left', 'top-right']),
  className: PropTypes.string,
  searchable: PropTypes.bool,
  onSelect: PropTypes.func,
}

export function Dropdown({ trigger, items = [], position = 'bottom-left', className, onSelect, searchable }) {
  const anchorRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)

  const toggleOpen = () => setIsOpen((prev) => !prev)
  const close = () => setIsOpen(false)

  const clonedTrigger = trigger({ ref: anchorRef, isOpen, toggle: toggleOpen })

  return (
    <div className={cn('relative inline-flex', className)}>
      {clonedTrigger}
      <DropdownMenu
        anchorRef={anchorRef}
        isOpen={isOpen}
        onClose={close}
        items={items}
        position={position}
        searchable={searchable}
        onSelect={onSelect}
      />
    </div>
  )
}

Dropdown.propTypes = {
  trigger: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  position: PropTypes.oneOf(['bottom-left', 'bottom-right', 'top-left', 'top-right']),
  className: PropTypes.string,
  onSelect: PropTypes.func,
  searchable: PropTypes.bool,
}

/*
Example usage:
<Dropdown
  trigger={({ ref, toggle, isOpen }) => (
    <Button ref={ref} variant="secondary" onClick={toggle} aria-expanded={isOpen}>
      Actions
    </Button>
  )}
  items={[
    { label: 'View details', value: 'view' },
    { label: 'Export', value: 'export' },
    { divider: true },
    { label: 'Delete', value: 'delete', onClick: handleDelete, icon: Trash }
  ]}
  position="bottom-right"
  onSelect={(item) => console.log(item)}
/>
*/

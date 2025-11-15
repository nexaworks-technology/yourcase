import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
  full: 'w-full h-full',
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
  footer,
}) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    dialogRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose?.()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center md:items-center">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur transition-opacity animate-[fade-in_0.2s_ease-out]"
        onClick={handleOverlayClick}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        ref={dialogRef}
        className={cn(
          'relative mx-0 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white dark:bg-slate-900 shadow-xl outline-none animate-[slide-up_0.3s_ease-out] md:mx-4 md:rounded-3xl',
          sizeMap[size],
          className,
        )}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 dark:text-slate-500 transition hover:text-slate-600 dark:hover:text-slate-300 dark:text-slate-300"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-6 text-slate-700 dark:text-slate-300">{children}</div>

        {footer && (
          <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-6 py-4">{footer}</div>
        )}
      </div>
    </div>
  )
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  children: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  showCloseButton: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
  className: PropTypes.string,
  footer: PropTypes.node,
}

/*
Example usage:
<Modal
  isOpen={isModalOpen}
  onClose={() => setModalOpen(false)}
  title="Invite team member"
  size="lg"
  footer={
    <div className="flex justify-end gap-3">
      <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
      <Button>Send invite</Button>
    </div>
  }
>
  <InviteForm />
</Modal>
*/

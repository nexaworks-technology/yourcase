import { useState } from 'react'
import PropTypes from 'prop-types'
import { Eye, Lightbulb, Send, Sparkles } from 'lucide-react'

import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

const typeToComponent = {
  text: Input,
  number: Input,
  date: Input,
  select: Input,
  textarea: Textarea,
}

export function UseTemplateModal({ isOpen, onClose, template, onGenerate, onPreview, onAIHelp }) {
  const [values, setValues] = useState(() =>
    (template?.variables || []).reduce((acc, variable) => {
      acc[variable.name] = variable.defaultValue ?? ''
      return acc
    }, {}),
  )
  const [matterId, setMatterId] = useState('')
  const [previewing, setPreviewing] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handlePreview = async () => {
    setPreviewing(true)
    try {
      await onPreview?.(template, values)
    } finally {
      setPreviewing(false)
    }
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      await onGenerate?.({ templateId: template.id, values, matterId })
      onClose?.()
    } finally {
      setLoading(false)
    }
  }

  const variables = template?.variables || []

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Use template: ${template?.name || ''}`}
      size="lg"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <Sparkles className="h-3.5 w-3.5" />
            AI-assisted suggestions available for common fields
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handlePreview} loading={previewing}>
              Preview
            </Button>
            <Button variant="primary" onClick={handleGenerate} loading={loading}>
              Generate document
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Fill in template data</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">Provide the details below and YourCase AI will assemble a polished document tailored to your matter.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Attach to matter (optional)" value={matterId} onChange={(event) => setMatterId(event.target.value)} placeholder="Search matter" />
          <Button
            variant="secondary"
            icon={Lightbulb}
            onClick={() => onAIHelp?.(template, values)}
            className="h-11 justify-center"
          >
            Help me fill this
          </Button>
        </div>

        <div className="space-y-4">
          {variables.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
              No variables defined. Add dynamic fields to personalise this template.
            </div>
          )}

          {variables.map((variable) => {
            const Component = typeToComponent[variable.type] || Input
            const baseProps = {
              key: variable.name,
              label: `${variable.label || variable.name}${variable.required ? ' *' : ''}`,
              value: values[variable.name] || '',
              onChange: (event) => handleChange(variable.name, event.target.value),
              placeholder: variable.helpText,
              required: variable.required,
            }

            if (variable.type === 'number') baseProps.type = 'number'
            if (variable.type === 'date') baseProps.type = 'date'

            return (
              <div key={variable.name} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
                <Component {...baseProps} />
                {variable.type === 'select' && (
                  <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Options: {variable.options?.join(', ')}</p>
                )}
                {variable.helpText && <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{variable.helpText}</p>}
              </div>
            )
          })}
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <header className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <Eye className="h-4 w-4" /> Live preview
          </header>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Preview helps validate fields before generating final output.</p>
          <div className="mt-4 space-y-3">
            {Object.entries(values).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                <span>{key}</span>
                <span className="max-w-[60%] truncate text-slate-700 dark:text-slate-300">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

UseTemplateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  template: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    variables: PropTypes.array,
  }).isRequired,
  onGenerate: PropTypes.func,
  onPreview: PropTypes.func,
  onAIHelp: PropTypes.func,
}

UseTemplateModal.defaultProps = {
  onGenerate: undefined,
  onPreview: undefined,
  onAIHelp: undefined,
}

export default UseTemplateModal

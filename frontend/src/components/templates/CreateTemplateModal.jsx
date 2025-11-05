import { useState } from 'react'
import PropTypes from 'prop-types'
import { Plus, Trash2 } from 'lucide-react'

import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/cn'
import { RichTextEditor } from './RichTextEditor'

const categories = ['Contracts', 'Legal Notices', 'Petitions', 'Memos', 'Agreements', 'Letters', 'Affidavits']
const jurisdictions = ['All India', 'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh']
const languages = ['English', 'Hindi', 'Marathi', 'Kannada', 'Tamil']

const variableTypes = ['text', 'number', 'date', 'select', 'textarea']
const visibilityOptions = ['Private', 'Team', 'Public']

export function CreateTemplateModal({ isOpen, onClose, onSave, initialTemplate }) {
  const [step, setStep] = useState(1)
  const [template, setTemplate] = useState(
    initialTemplate || {
      name: '',
      category: 'Contracts',
      jurisdiction: 'All India',
      language: 'English',
      description: '',
      tags: [],
      content: '',
      variables: [],
      settings: {
        fontFamily: 'Inter',
        fontSize: 12,
        lineSpacing: 1.5,
        margins: {
          top: 1,
          bottom: 1,
          left: 1,
          right: 1,
        },
        laws: [],
        visibility: 'Private',
        version: '1.0',
      },
    },
  )
  const [tagInput, setTagInput] = useState('')
  const [lawInput, setLawInput] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChange = (field, value) => {
    setTemplate((prev) => ({ ...prev, [field]: value }))
  }

  const handleVariableChange = (index, field, value) => {
    setTemplate((prev) => {
      const variables = [...prev.variables]
      variables[index] = { ...variables[index], [field]: value }
      return { ...prev, variables }
    })
  }

  const addVariable = () => {
    setTemplate((prev) => ({
      ...prev,
      variables: [
        ...prev.variables,
        {
          name: `variable${prev.variables.length + 1}`,
          label: 'New field',
          type: 'text',
          required: false,
          defaultValue: '',
          options: [],
          helpText: '',
        },
      ],
    }))
  }

  const removeVariable = (index) => {
    setTemplate((prev) => ({
      ...prev,
      variables: prev.variables.filter((_, idx) => idx !== index),
    }))
  }

  const addTag = () => {
    const value = tagInput.trim()
    if (!value || template.tags.includes(value)) return
    handleChange('tags', [...template.tags, value])
    setTagInput('')
  }

  const removeTag = (tag) => {
    handleChange('tags', template.tags.filter((item) => item !== tag))
  }

  const addLaw = () => {
    const value = lawInput.trim()
    if (!value || template.settings.laws.includes(value)) return
    setTemplate((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        laws: [...prev.settings.laws, value],
      },
    }))
    setLawInput('')
  }

  const removeLaw = (law) => {
    setTemplate((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        laws: prev.settings.laws.filter((item) => item !== law),
      },
    }))
  }

  const handleSave = async (status) => {
    setSaving(true)
    try {
      await onSave?.({ ...template, status })
      onClose?.()
    } finally {
      setSaving(false)
    }
  }

  const steps = [
    {
      title: 'Basic information',
      render: (
        <div className="space-y-4">
          <Input label="Template name" value={template.name} onChange={(event) => handleChange('name', event.target.value)} required />
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</label>
              <select
                value={template.category}
                onChange={(event) => handleChange('category', event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 focus:border-blue-500 focus:outline-none"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Jurisdiction</label>
              <select
                value={template.jurisdiction}
                onChange={(event) => handleChange('jurisdiction', event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 focus:border-blue-500 focus:outline-none"
              >
                {jurisdictions.map((jurisdiction) => (
                  <option key={jurisdiction} value={jurisdiction}>
                    {jurisdiction}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Language</label>
              <select
                value={template.language}
                onChange={(event) => handleChange('language', event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 focus:border-blue-500 focus:outline-none"
              >
                {languages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Textarea
            label="Description"
            value={template.description}
            onChange={(event) => handleChange('description', event.target.value)}
            rows={3}
          />
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tags</label>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {template.tags.map((tag) => (
                <Badge key={tag} variant="secondary" size="sm" removable onRemove={() => removeTag(tag)}>
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input value={tagInput} onChange={(event) => setTagInput(event.target.value)} placeholder="Add tag" />
              <Button type="button" variant="secondary" onClick={addTag}>
                Add
              </Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Template content',
      render: (
        <RichTextEditor
          content={template.content}
          onChange={(content) => handleChange('content', content)}
          variables={template.variables}
          onInsertVariable={(variable) => handleChange('content', `${template.content} {{${variable}}}`)}
        />
      ),
    },
    {
      title: 'Variables & data',
      render: (
        <div className="space-y-4">
          {template.variables.map((variable, index) => (
            <div key={variable.name + index} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-slate-900">{variable.label || variable.name}</h4>
                <Button variant="ghost" size="sm" icon={Trash2} onClick={() => removeVariable(index)}>
                  Remove
                </Button>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Input label="Variable name" value={variable.name} onChange={(event) => handleVariableChange(index, 'name', event.target.value)} required />
                <Input label="Label" value={variable.label} onChange={(event) => handleVariableChange(index, 'label', event.target.value)} />
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Type</label>
                  <select
                    value={variable.type}
                    onChange={(event) => handleVariableChange(index, 'type', event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 focus:border-blue-500 focus:outline-none"
                  >
                    {variableTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Default value"
                  value={variable.defaultValue || ''}
                  onChange={(event) => handleVariableChange(index, 'defaultValue', event.target.value)}
                />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Textarea
                  label="Help text"
                  value={variable.helpText || ''}
                  onChange={(event) => handleVariableChange(index, 'helpText', event.target.value)}
                  rows={2}
                />
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={variable.required}
                      onChange={(event) => handleVariableChange(index, 'required', event.target.checked)}
                    />
                    Required field
                  </label>
                  {variable.type === 'select' && (
                    <Textarea
                      label="Options (comma separated)"
                      value={variable.options?.join(', ') || ''}
                      onChange={(event) => handleVariableChange(index, 'options', event.target.value.split(',').map((item) => item.trim()))}
                      rows={2}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="secondary" icon={Plus} onClick={addVariable}>
            Add variable
          </Button>
        </div>
      ),
    },
    {
      title: 'Formatting & settings',
      render: (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Font family</label>
              <select
                value={template.settings.fontFamily}
                onChange={(event) =>
                  setTemplate((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, fontFamily: event.target.value },
                  }))
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 focus:border-blue-500 focus:outline-none"
              >
                {['Inter', 'Roboto', 'Times New Roman', 'Georgia', 'Calibri'].map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Font size (pt)"
              type="number"
              value={template.settings.fontSize}
              onChange={(event) =>
                setTemplate((prev) => ({
                  ...prev,
                  settings: { ...prev.settings, fontSize: Number(event.target.value) },
                }))
              }
            />
            <Input
              label="Line spacing"
              type="number"
              step="0.1"
              value={template.settings.lineSpacing}
              onChange={(event) =>
                setTemplate((prev) => ({
                  ...prev,
                  settings: { ...prev.settings, lineSpacing: Number(event.target.value) },
                }))
              }
            />
            <Input
              label="Version"
              value={template.settings.version}
              onChange={(event) =>
                setTemplate((prev) => ({
                  ...prev,
                  settings: { ...prev.settings, version: event.target.value },
                }))
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {['top', 'bottom', 'left', 'right'].map((side) => (
              <Input
                key={side}
                label={`Margin ${side} (inches)`}
                type="number"
                step="0.1"
                value={template.settings.margins[side]}
                onChange={(event) =>
                  setTemplate((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      margins: { ...prev.settings.margins, [side]: Number(event.target.value) },
                    },
                  }))
                }
              />
            ))}
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Applicable laws</label>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {template.settings.laws.map((law) => (
                <Badge key={law} variant="secondary" size="sm" removable onRemove={() => removeLaw(law)}>
                  {law}
                </Badge>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input value={lawInput} onChange={(event) => setLawInput(event.target.value)} placeholder="e.g., Companies Act 2013" />
              <Button type="button" variant="secondary" onClick={addLaw}>
                Add
              </Button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Visibility</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {visibilityOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs transition',
                    template.settings.visibility === option
                      ? 'border-blue-200 bg-blue-50 text-blue-600 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-100',
                  )}
                  onClick={() =>
                    setTemplate((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, visibility: option },
                    }))
                  }
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create template"
      size="xl"
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {steps.map((item, index) => (
              <div
                key={item.title}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-1 text-xs',
                  step === index + 1 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500',
                )}
              >
                {index + 1}. {item.title}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => handleSave('draft')} loading={saving}>
              Save draft
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {step > 1 && (
              <Button variant="secondary" onClick={() => setStep((prev) => prev - 1)}>
                Previous
              </Button>
            )}
            {step < steps.length && (
              <Button variant="primary" onClick={() => setStep((prev) => prev + 1)}>
                Next
              </Button>
            )}
            {step === steps.length && (
              <Button variant="primary" onClick={() => handleSave('published')} loading={saving}>
                Publish template
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">{steps[step - 1].render}</div>
    </Modal>
  )
}

CreateTemplateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
  initialTemplate: PropTypes.object,
}

CreateTemplateModal.defaultProps = {
  onSave: undefined,
  initialTemplate: null,
}

export default CreateTemplateModal

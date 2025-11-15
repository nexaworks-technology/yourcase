import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { format } from 'date-fns'
import { Calendar, CheckCircle2, FilePlus, FileText, Flag, ShieldCheck, Users } from 'lucide-react'

import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/cn'

const steps = [
  { id: 1, name: 'Basic info', icon: FileText },
  { id: 2, name: 'Matter details', icon: ShieldCheck },
  { id: 3, name: 'Assignments', icon: Users },
]

const typeOptions = ['Litigation', 'Corporate', 'Compliance', 'Contracts', 'Tax', 'IPR', 'Real Estate', 'Family Law', 'Criminal']
const priorityOptions = ['low', 'medium', 'high', 'urgent']

const defaultState = {
  matterNumber: '',
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  title: '',
  type: '',
  priority: 'medium',
  description: '',
  startDate: '',
  expectedEndDate: '',
  courtDetails: {
    courtName: '',
    caseNumber: '',
    judgeName: '',
    nextHearing: '',
  },
  financial: {
    estimatedValue: '',
    fees: '',
    currency: 'INR',
  },
  tags: [],
  assignedLawyers: [],
  permissions: 'workspace',
}

const buildState = (initialData) => {
  if (!initialData) return defaultState
  return {
    ...defaultState,
    ...initialData,
    courtDetails: {
      ...defaultState.courtDetails,
      ...(initialData.courtDetails || {}),
    },
    financial: {
      ...defaultState.financial,
      ...(initialData.financial || {}),
    },
    tags: initialData.tags || [],
    assignedLawyers: initialData.assignedLawyers || [],
  }
}

export function CreateMatterModal({ isOpen, onClose, onSubmit, lawyers = [], initialData = null }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(defaultState)
  const [errors, setErrors] = useState({})
  const [tagValue, setTagValue] = useState('')
  const [saving, setSaving] = useState(false)

  const courtFieldsVisible = useMemo(() => form.type === 'Litigation', [form.type])
  const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length))
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

  useEffect(() => {
    if (!isOpen) return
    setStep(1)
    setErrors({})
    setTagValue('')
    setForm(buildState(initialData))
  }, [isOpen, initialData])

  const handleClose = () => {
    onClose?.()
  }

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))
  const updateNested = (field, key, value) => setForm((prev) => ({ ...prev, [field]: { ...prev[field], [key]: value } }))

  const validate = () => {
    const next = {}
    if (step === 1) {
      if (!form.clientName.trim()) next.clientName = 'Client name required'
      if (!form.title.trim()) next.title = 'Matter title required'
      if (!form.type) next.type = 'Select matter type'
    }
    if (step === 2) {
      if (!form.startDate) next.startDate = 'Start date required'
      if (courtFieldsVisible && !form.courtDetails.caseNumber.trim()) next.caseNumber = 'Case number required'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleStepChange = (direction) => {
    if (direction === 'next') {
      if (!validate()) return
      nextStep()
    } else {
      prevStep()
    }
  }

  const handleSubmit = async (payload) => {
    setSaving(true)
    try {
      await onSubmit?.(payload)
      handleClose()
    } finally {
      setSaving(false)
    }
  }

  const handleCreate = () => {
    if (!validate()) return
    handleSubmit(form)
  }

  const handleSaveDraft = () => {
    handleSubmit({ ...form, status: 'draft' })
  }

  const addTag = () => {
    const value = tagValue.trim()
    if (!value || form.tags.includes(value)) return
    updateField('tags', [...form.tags, value])
    setTagValue('')
  }

  const toggleLawyer = (id) => {
    const next = new Set(form.assignedLawyers)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    updateField('assignedLawyers', Array.from(next))
  }

  const stepOne = (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Matter number" placeholder="Auto-generated" value={form.matterNumber} onChange={(e) => updateField('matterNumber', e.target.value)} />
        <Input label="Client name" required value={form.clientName} onChange={(e) => updateField('clientName', e.target.value)} error={errors.clientName} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Client email" type="email" value={form.clientEmail} onChange={(e) => updateField('clientEmail', e.target.value)} />
        <Input label="Client phone" value={form.clientPhone} onChange={(e) => updateField('clientPhone', e.target.value)} />
      </div>
      <Input label="Matter title" required value={form.title} onChange={(e) => updateField('title', e.target.value)} error={errors.title} />
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">Matter type</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {typeOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={cn('rounded-full border px-3 py-1 text-xs transition', form.type === option ? 'border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800')}
                onClick={() => updateField('type', option)}
              >
                {option}
              </button>
            ))}
          </div>
          {errors.type && <p className="mt-1 text-xs text-rose-500">{errors.type}</p>}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">Priority</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {priorityOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={cn('flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition', form.priority === option ? 'border-rose-200 bg-rose-50 text-rose-600 shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800')}
                onClick={() => updateField('priority', option)}
              >
                <Flag className="h-3 w-3" />
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <Textarea label="Matter description" value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={4} />
    </div>
  )

  const stepTwo = (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Input type="date" label="Start date" required value={form.startDate} onChange={(e) => updateField('startDate', e.target.value)} error={errors.startDate} />
        <Input type="date" label="Expected end date" value={form.expectedEndDate} onChange={(e) => updateField('expectedEndDate', e.target.value)} />
      </div>
      {courtFieldsVisible && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
          <h4 className="text-sm font-semibold text-blue-800">Court details</h4>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <Input label="Court name" value={form.courtDetails.courtName} onChange={(e) => updateNested('courtDetails', 'courtName', e.target.value)} />
            <Input label="Case number" value={form.courtDetails.caseNumber} onChange={(e) => updateNested('courtDetails', 'caseNumber', e.target.value)} error={errors.caseNumber} />
            <Input label="Judge name" value={form.courtDetails.judgeName} onChange={(e) => updateNested('courtDetails', 'judgeName', e.target.value)} />
            <Input type="date" label="Next hearing date" value={form.courtDetails.nextHearing} onChange={(e) => updateNested('courtDetails', 'nextHearing', e.target.value)} />
          </div>
        </div>
      )}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
        <h4 className="text-sm font-semibold text-emerald-800">Financial details</h4>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <Input type="number" label="Estimated value" value={form.financial.estimatedValue} onChange={(e) => updateNested('financial', 'estimatedValue', e.target.value)} />
          <Input type="number" label="Fees" value={form.financial.fees} onChange={(e) => updateNested('financial', 'fees', e.target.value)} />
          <Input label="Currency" value={form.financial.currency} onChange={(e) => updateNested('financial', 'currency', e.target.value)} />
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">Tags</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {form.tags.map((tag) => (
            <Badge key={tag} variant="secondary" size="sm" className="flex items-center gap-2">
              {tag}
              <button type="button" className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 dark:text-slate-300" onClick={() => updateField('tags', form.tags.filter((item) => item !== tag))}>
                ×
              </button>
            </Badge>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Input value={tagValue} onChange={(e) => setTagValue(e.target.value)} placeholder="Add tag" />
          <Button type="button" variant="secondary" onClick={addTag}>
            Add
          </Button>
        </div>
      </div>
    </div>
  )

  const stepThree = (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Assign lawyers</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Choose primary and supporting lawyers.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {lawyers.map((lawyer) => {
            const selected = form.assignedLawyers.includes(lawyer.id)
            return (
              <button
                key={lawyer.id}
                type="button"
                onClick={() => toggleLawyer(lawyer.id)}
                className={cn('flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition', selected ? 'border-blue-200 bg-blue-50 text-blue-600 shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800')}
              >
                <img src={lawyer.avatar} alt={lawyer.name} className="h-6 w-6 rounded-full object-cover" />
                {lawyer.name}
              </button>
            )
          })}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">Permissions</p>
          <select
            value={form.permissions}
            onChange={(e) => updateField('permissions', e.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-600 dark:text-slate-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
          >
            <option value="workspace">Workspace (all team members)</option>
            <option value="assigned">Assigned lawyers only</option>
            <option value="custom">Custom sharing</option>
          </select>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">Attach existing documents</p>
          <div className="mt-2 flex h-24 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-center text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
            <FilePlus className="h-6 w-6 text-slate-400 dark:text-slate-500" />
            Drag & drop or browse files
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Review summary</h4>
        <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <li>
            <CheckCircle2 className="mr-2 inline h-4 w-4 text-emerald-500" />
            {form.clientName || 'Client TBD'} — {form.title || 'Matter title pending'}
          </li>
          <li>
            <CheckCircle2 className="mr-2 inline h-4 w-4 text-emerald-500" />
            Type: {form.type || '—'} · Priority: {form.priority}
          </li>
          <li>
            <CheckCircle2 className="mr-2 inline h-4 w-4 text-emerald-500" />
            Start: {form.startDate ? format(new Date(form.startDate), 'PPP') : 'Not set'}
          </li>
          <li>
            <CheckCircle2 className="mr-2 inline h-4 w-4 text-emerald-500" />
            Assigned lawyers: {form.assignedLawyers.length}
          </li>
        </ul>
      </div>
    </div>
  )

  const stepContent = { 1: stepOne, 2: stepTwo, 3: stepThree }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create new matter"
      size="xl"
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {steps.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-1 text-xs transition',
                  step === item.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500',
                )}
              >
                <item.icon className="h-3 w-3" />
                {item.name}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={handleSaveDraft} loading={saving}>
              Save draft
            </Button>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            {step > 1 && (
              <Button variant="secondary" onClick={() => handleStepChange('prev')}>
                Previous
              </Button>
            )}
            {step < steps.length && (
              <Button variant="primary" onClick={() => handleStepChange('next')}>
                Next
              </Button>
            )}
            {step === steps.length && (
              <Button variant="primary" onClick={handleCreate} loading={saving}>
                Create matter
              </Button>
            )}
          </div>
        </div>
      }
    >
      {stepContent[step]}
    </Modal>
  )
}

CreateMatterModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  lawyers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string,
      avatar: PropTypes.string,
    }),
  ),
  initialData: PropTypes.object,
}

CreateMatterModal.defaultProps = {
  onSubmit: undefined,
  lawyers: [],
  initialData: null,
}

export default CreateMatterModal

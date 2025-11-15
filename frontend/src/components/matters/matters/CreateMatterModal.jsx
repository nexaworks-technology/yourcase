import { useState } from 'react'
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

const typeOptions = [
  'Litigation',
  'Corporate',
  'Compliance',
  'Contracts',
  'Tax',
  'IPR',
  'Real Estate',
  'Family Law',
  'Criminal',
]

const priorityOptions = ['Low', 'Medium', 'High', 'Urgent']

const initialFormState = {
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
  attachedDocuments: [],
}

export function CreateMatterModal({ isOpen, onClose, onSubmit, lawyers = [] }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNestedChange = (path, value) => {
    setFormData((prev) => {
      const [parent, child] = path.split('.')
      return {
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }
    })
  }

  const validateStep = () => {
    const nextErrors = {}

    if (step === 1) {
      if (!formData.clientName?.trim()) nextErrors.clientName = 'Client name is required'
      if (!formData.title?.trim()) nextErrors.title = 'Matter title is required'
      if (!formData.type) nextErrors.type = 'Select a matter type'
    }

    if (step === 2) {
      if (!formData.startDate) nextErrors.startDate = 'Start date required'
      if (formData.type === 'Litigation' && !formData.courtDetails.caseNumber) {
        nextErrors.caseNumber = 'Case number required for litigation matters'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleNext = () => {
    if (!validateStep()) return
    setStep((prev) => Math.min(prev + 1, steps.length))
  }

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const handleAddTag = () => {
    const value = tagInput.trim()
    if (!value) return
    if (formData.tags.includes(value)) return
    handleChange('tags', [...formData.tags, value])
    setTagInput('')
  }

  const handleRemoveTag = (tag) => {
    handleChange('tags', formData.tags.filter((item) => item !== tag))
  }

  const toggleLawyer = (id) => {
    const assigned = new Set(formData.assignedLawyers)
    if (assigned.has(id)) assigned.delete(id)
    else assigned.add(id)
    handleChange('assignedLawyers', Array.from(assigned))
  }

  const handleSubmit = async () => {
    if (!validateStep()) return
    setSaving(true)
    try {
      await onSubmit?.(formData)
      setFormData(initialFormState)
      setStep(1)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleSaveDraft = async () => {
    setSaving(true)
    try {
      await onSubmit?.({ ...formData, status: 'draft' })
      setFormData(initialFormState)
      setStep(1)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Matter number"
              placeholder="Auto-generated"
              value={formData.matterNumber}
              onChange={(event) => handleChange('matterNumber', event.target.value)}
            />
            <Input
              label="Client name"
              required
              value={formData.clientName}
              onChange={(event) => handleChange('clientName', event.target.value)}
              error={errors.clientName}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Client email"
              type="email"
              value={formData.clientEmail}
              onChange={(event) => handleChange('clientEmail', event.target.value)}
            />
            <Input
              label="Client phone"
              value={formData.clientPhone}
              onChange={(event) => handleChange('clientPhone', event.target.value)}
            />
          </div>
          <Input
            label="Matter title"
            required
            value={formData.title}
            onChange={(event) => handleChange('title', event.target.value)}
            error={errors.title}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">Matter type</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {typeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={cn('rounded-full border px-3 py-1 text-xs transition', formData.type === option
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800')}
                    onClick={() => handleChange('type', option)}
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
                    className={cn('flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition', formData.priority === option.toLowerCase()
                      ? 'border-rose-200 bg-rose-50 text-rose-600 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800')}
                    onClick={() => handleChange('priority', option.toLowerCase())}
                  >
                    <Flag className="h-3 w-3" />
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Textarea
            label="Matter description"
            value={formData.description}
            onChange={(event) => handleChange('description', event.target.value)}
            rows={4}
          />
        </div>
      )
    }

    if (step === 2) {
      return (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              type="date"
              label="Start date"
              required
              value={formData.startDate}
              onChange={(event) => handleChange('startDate', event.target.value)}
              error={errors.startDate}
            />
            <Input
              type="date"
              label="Expected end date"
              value={formData.expectedEndDate}
              onChange={(event) => handleChange('expectedEndDate', event.target.value)}
            />
          </div>
          {formData.type === 'Litigation' && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <h4 className="text-sm font-semibold text-blue-800">Court details</h4>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <Input
                  label="Court name"
                  value={formData.courtDetails.courtName}
                  onChange={(event) => handleNestedChange('courtDetails.courtName', event.target.value)}
                />
                <Input
                  label="Case number"
                  value={formData.courtDetails.caseNumber}
                  onChange={(event) => handleNestedChange('courtDetails.caseNumber', event.target.value)}
                  error={errors.caseNumber}
                />
                <Input
                  label="Judge name"
                  value={formData.courtDetails.judgeName}
                  onChange={(event) => handleNestedChange('courtDetails.judgeName', event.target.value)}
                />
                <Input
                  type="date"
                  label="Next hearing date"
                  value={formData.courtDetails.nextHearing}
                  onChange={(event) => handleNestedChange('courtDetails.nextHearing', event.target.value)}
                />
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <h4 className="text-sm font-semibold text-emerald-800">Financial details</h4>
            <div className="mt-3 grid gap-4 md:grid-cols-3">
              <Input
                label="Estimated value"
                type="number"
                value={formData.financial.estimatedValue}
                onChange={(event) => handleNestedChange('financial.estimatedValue', event.target.value)}
              />
              <Input
                label="Fees to be charged"
                type="number"
                value={formData.financial.fees}
                onChangeақәа`}

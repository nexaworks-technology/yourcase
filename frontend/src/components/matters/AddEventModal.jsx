import { useState } from 'react'
import PropTypes from 'prop-types'
import { CalendarClock, FileText, UserPlus } from 'lucide-react'

import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

const eventTypes = [
  { value: 'status-change', label: 'Status change' },
  { value: 'document', label: 'Document uploaded' },
  { value: 'hearing', label: 'Hearing date' },
  { value: 'milestone', label: 'Milestone reached' },
  { value: 'team', label: 'Team update' },
  { value: 'note', label: 'General note' },
]

export function AddEventModal({ isOpen, onClose, onSubmit, defaultDate }) {
  const [form, setForm] = useState({
    type: 'status-change',
    title: '',
    description: '',
    date: defaultDate ? defaultDate.slice(0, 16) : '',
    attachments: [],
    participants: [],
  })
  const [participantValue, setParticipantValue] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleAttach = (event) => {
    const files = Array.from(event.target.files || [])
    handleChange('attachments', [...form.attachments, ...files])
  }

  const handleAddParticipant = () => {
    const value = participantValue.trim()
    if (!value) return
    if (form.participants.includes(value)) return
    handleChange('participants', [...form.participants, value])
    setParticipantValue('')
  }

  const handleRemoveParticipant = (value) => {
    handleChange('participants', form.participants.filter((participant) => participant !== value))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await onSubmit?.({ ...form, date: form.date ? new Date(form.date).toISOString() : new Date().toISOString() })
      onClose?.()
      setForm({ type: 'status-change', title: '', description: '', date: '', attachments: [], participants: [] })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setSaving(false)
        onClose?.()
      }}
      title="Add matter event"
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={saving}>
            Add event
          </Button>
        </div>
      }
    >
      <form className="space-y-5">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">Event type</label>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {eventTypes.map((option) => (
              <button
                type="button"
                key={option.value}
                className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition ${
                  form.type === option.value ? 'border-blue-200 bg-blue-50 text-blue-600 shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800'
                }`}
                onClick={() => handleChange('type', option.value)}
              >
                <FileText className="h-4 w-4" />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Event title"
          placeholder="e.g., Filed motion to dismiss"
          value={form.title}
          onChange={(event) => handleChange('title', event.target.value)}
          required
        />

        <Textarea
          label="Description"
          placeholder="Describe what happened and capture any key outcomes or next steps."
          value={form.description}
          onChange={(event) => handleChange('description', event.target.value)}
          rows={4}
        />

        <Input
          label="Date & time"
          type="datetime-local"
          value={form.date}
          onChange={(event) => handleChange('date', event.target.value)}
          required
        />

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">Attachments</label>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
            <input type="file" className="hidden" id="event-attachments" multiple onChange={handleAttach} />
            <label htmlFor="event-attachments" className="cursor-pointer text-blue-600 hover:text-blue-700">
              Click to upload or drag files
            </label>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">PDF, DOCX, images up to 25MB</p>
          </div>
          {form.attachments.length > 0 && (
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {form.attachments.map((file, index) => (
                <li key={`${file.name}-${index}`} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-sm">
                  {file.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">Participants</label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Add by email"
              value={participantValue}
              onChange={(event) => setParticipantValue(event.target.value)}
            />
            <Button type="button" variant="secondary" icon={UserPlus} onClick={handleAddParticipant}>
              Add
            </Button>
          </div>
          {form.participants.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.participants.map((participant) => (
                <Badge key={participant} variant="secondary" size="sm" removable onRemove={() => handleRemoveParticipant(participant)}>
                  {participant}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </form>
    </Modal>
  )
}

AddEventModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  defaultDate: PropTypes.string,
}

AddEventModal.defaultProps = {
  onSubmit: undefined,
  defaultDate: new Date().toISOString(),
}

export default AddEventModal

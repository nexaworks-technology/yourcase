import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Card } from '../ui/Card'

export function DocumentMetadata({
  metadata = {},
  onSave,
  onChange,
  editable = true,
  saving,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(metadata)
  const [errors, setErrors] = useState({})
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    setFormData(metadata)
  }, [metadata])

  const handleFieldChange = (field, value) => {
    const next = { ...formData, [field]: value }
    setFormData(next)
    onChange?.(next)
  }

  const handleTagRemove = (tag) => {
    handleFieldChange('tags', (formData.tags || []).filter((item) => item !== tag))
  }

  const handleTagAdd = () => {
    const value = tagInput.trim()
    if (!value) return
    handleFieldChange('tags', Array.from(new Set([...(formData.tags || []), value])))
    setTagInput('')
  }

  const validate = () => {
    const nextErrors = {}
    if (!formData.name) nextErrors.name = 'Document name is required'
    if (!formData.type) nextErrors.type = 'Select a document type'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    await onSave?.(formData)
    setIsEditing(false)
  }

  const renderField = (label, value) => (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value || '—'}</p>
    </div>
  )

  if (!editable || !isEditing) {
    return (
      <div className="space-y-4">
        <Card className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              {renderField('Original filename', metadata.originalName)}
              {renderField('File size', metadata.size)}
              {renderField('Pages', metadata.pages)}
              {renderField('Uploaded', metadata.uploadedAt)}
              {renderField('Uploaded by', metadata.uploadedBy?.name)}
              {renderField('Last modified', metadata.updatedAt)}
            </div>
            {editable && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                Edit metadata
              </Button>
            )}
          </div>
        </Card>

        <Card className="rounded-2xl border border-slate-200 p-4">
          <h4 className="text-sm font-semibold text-slate-900">Matter details</h4>
          <dl className="mt-3 space-y-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <dt className="text-slate-500">Matter</dt>
              <dd className="text-blue-600 hover:text-blue-700">{metadata.matter?.name || 'Unassigned'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Matter ID</dt>
              <dd>{metadata.matter?.number || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Client</dt>
              <dd>{metadata.matter?.client || '—'}</dd>
            </div>
          </dl>
        </Card>

        <Card className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900">Tags</h4>
            {editable && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                Manage tags
              </Button>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(metadata.tags || []).length > 0 ? (
              metadata.tags.map((tag) => (
                <Badge key={tag} variant="secondary" size="sm">
                  {tag}
                </Badge>
              ))
            ) : (
              <p className="text-xs text-slate-400">No tags yet</p>
            )}
          </div>
        </Card>

        {metadata.customFields && Object.keys(metadata.customFields).length > 0 && (
          <Card className="rounded-2xl border border-slate-200 p-4">
            <h4 className="text-sm font-semibold text-slate-900">Custom Fields</h4>
            <dl className="mt-3 space-y-2 text-sm text-slate-600">
              {Object.entries(metadata.customFields).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <dt className="text-slate-500">{key}</dt>
                  <dd className="text-slate-900">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </Card>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="space-y-4 rounded-2xl border border-slate-200 p-4">
        <Input
          label="Document name"
          value={formData.name}
          onChange={(event) => handleFieldChange('name', event.target.value)}
          error={errors.name}
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Document type"
            value={formData.type}
            onChange={(event) => handleFieldChange('type', event.target.value)}
            error={errors.type}
            required
          />
          <Input
            label="Matter"
            value={formData.matter?.name || ''}
            onChange={(event) => handleFieldChange('matter', { ...formData.matter, name: event.target.value })}
          />
        </div>
        <Textarea
          label="Description / Notes"
          value={formData.description || ''}
          onChange={(event) => handleFieldChange('description', event.target.value)}
          rows={3}
        />
      </Card>

      <Card className="space-y-3 rounded-2xl border border-slate-200 p-4">
        <h4 className="text-sm font-semibold text-slate-900">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {(formData.tags || []).map((tag) => (
              <Badge key={tag} variant="secondary" size="sm" className="flex items-center gap-2">
                {tag}
                <button
                  type="button"
                className="text-xs text-slate-500 hover:text-slate-700"
                onClick={() => handleTagRemove(tag)}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add tag"
            className="flex-1"
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
          />
          <Button type="button" variant="secondary" size="sm" onClick={handleTagAdd}>
            Add
          </Button>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={saving}>
          Save changes
        </Button>
      </div>
    </form>
  )
}

DocumentMetadata.propTypes = {
  metadata: PropTypes.shape({
    name: PropTypes.string,
    originalName: PropTypes.string,
    size: PropTypes.string,
    pages: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    uploadedAt: PropTypes.string,
    updatedAt: PropTypes.string,
    uploadedBy: PropTypes.shape({ name: PropTypes.string, avatar: PropTypes.string }),
    matter: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      number: PropTypes.string,
      client: PropTypes.string,
    }),
    tags: PropTypes.arrayOf(PropTypes.string),
    type: PropTypes.string,
    description: PropTypes.string,
    customFields: PropTypes.object,
  }),
  onSave: PropTypes.func,
  onChange: PropTypes.func,
  editable: PropTypes.bool,
  saving: PropTypes.bool,
}

DocumentMetadata.defaultProps = {
  onSave: undefined,
  onChange: undefined,
  editable: true,
  saving: false,
}

export default DocumentMetadata

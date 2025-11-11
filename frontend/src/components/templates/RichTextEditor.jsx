import PropTypes from 'prop-types'
import { useState } from 'react'
import { Bold, Code2, Italic, List, ListOrdered, SplitSquareHorizontal, Underline, Variable } from 'lucide-react'

import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'

export function RichTextEditor({ content, onChange, variables = [], onInsertVariable }) {
  const [preview, setPreview] = useState(false)
  const [input, setInput] = useState(content || '')

  const handleInputChange = (event) => {
    setInput(event.target.value)
    onChange?.(event.target.value)
  }

  const handleInsertVariable = (variable) => {
    const nextContent = `${input} {{${variable}}}`
    setInput(nextContent)
    onChange?.(nextContent)
    onInsertVariable?.(variable)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
        <Button variant="ghost" size="sm" icon={Bold} disabled>B</Button>
        <Button variant="ghost" size="sm" icon={Italic} disabled>I</Button>
        <Button variant="ghost" size="sm" icon={Underline} disabled>U</Button>
        <Button variant="ghost" size="sm" icon={List} disabled />
        <Button variant="ghost" size="sm" icon={ListOrdered} disabled />
        <Button variant="ghost" size="sm" icon={Code2} disabled />
        <div className="ml-auto flex items-center gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {variables.map((variable) => (
              <button
                key={variable.name}
                type="button"
                onClick={() => handleInsertVariable(variable.name)}
                className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs text-indigo-600"
              >
                <Variable className="h-3.5 w-3.5" /> {variable.label || variable.name}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm" icon={SplitSquareHorizontal} onClick={() => setPreview((prev) => !prev)}>
            {preview ? 'Hide preview' : 'Split view'}
          </Button>
        </div>
      </div>

      <div className={cn('grid gap-4', preview ? 'lg:grid-cols-2' : 'lg:grid-cols-1')}>
        <textarea
          value={input}
          onChange={handleInputChange}
          className="min-h-[280px] w-full rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-inner focus:border-blue-500 focus:outline-none"
          placeholder="Draft template content using markdown or insert variables for dynamic data."
        />
        {preview && (
          <div className="min-h-[280px] rounded-3xl border border-slate-200 bg-white p-4 shadow-inner">
            <article className="prose prose-slate max-w-none text-sm text-slate-700 whitespace-pre-wrap">
              {input || 'Preview will appear here as you compose your template.'}
            </article>
          </div>
        )}
      </div>
    </div>
  )
}

RichTextEditor.propTypes = {
  content: PropTypes.string,
  onChange: PropTypes.func,
  variables: PropTypes.array,
  onInsertVariable: PropTypes.func,
}

RichTextEditor.defaultProps = {
  content: '',
  onChange: undefined,
  variables: [],
  onInsertVariable: undefined,
}

export default RichTextEditor

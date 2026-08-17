import { useId } from 'react'

export default function Textarea({ label, error, hint, className = '', id, ...props }) {
  const autoId = useId()
  const textareaId = id ?? autoId

  return (
    <div className="field">
      {label && (
        <label className="field-label" htmlFor={textareaId}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`textarea ${error ? 'has-error' : ''} ${className}`.trim()}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

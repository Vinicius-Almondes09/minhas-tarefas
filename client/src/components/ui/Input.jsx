import { useId } from 'react'

export default function Input({ label, error, hint, className = '', id, ...props }) {
  const autoId = useId()
  const inputId = id ?? autoId

  return (
    <div className="field">
      {label && (
        <label className="field-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input ${error ? 'has-error' : ''} ${className}`.trim()}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

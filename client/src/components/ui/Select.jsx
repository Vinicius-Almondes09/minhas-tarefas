import { useId } from 'react'

export default function Select({ label, error, hint, options = [], className = '', id, ...props }) {
  const autoId = useId()
  const selectId = id ?? autoId

  return (
    <div className="field">
      {label && (
        <label className="field-label" htmlFor={selectId}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`select ${error ? 'has-error' : ''} ${className}`.trim()}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

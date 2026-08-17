import Spinner from './Spinner'

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ...props
}) {
  const classes = ['btn', `btn-${variant}`, `btn-${size}`, className].filter(Boolean).join(' ')

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {loading && <Spinner size="sm" />}
      <span>{children}</span>
    </button>
  )
}

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-icon" aria-hidden="true">✓</span>
          <h1>{title}</h1>
        </div>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        {children}
      </div>
    </div>
  )
}

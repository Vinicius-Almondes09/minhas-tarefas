import { createPortal } from 'react-dom'

const ICONS = {
  success: '✅',
  error: '❌',
}

export default function ToastContainer({ toasts, onClose }) {
  if (toasts.length === 0) return null

  return createPortal(
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-icon" aria-hidden="true">{ICONS[toast.type]}</span>
          <p className="toast-message">{toast.message}</p>
          <button type="button" className="toast-close" onClick={() => onClose(toast.id)} aria-label="Fechar mensagem">
            ×
          </button>
        </div>
      ))}
    </div>,
    document.body
  )
}

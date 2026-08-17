import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({
  open,
  title = 'Confirmar ação',
  message,
  confirmLabel = 'Confirmar',
  onConfirm,
  onClose,
  loading = false,
  danger = true,
}) {
  return (
    <Modal open={open} title={title} onClose={onClose} size="sm">
      {message && <p className="confirm-message">{message}</p>}
      <div className="modal-footer">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

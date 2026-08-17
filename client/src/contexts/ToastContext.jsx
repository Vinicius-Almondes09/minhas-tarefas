import { createContext, useCallback, useContext, useRef, useState } from 'react'
import ToastContainer from '../components/ui/ToastContainer'

const ToastContext = createContext(null)

const TOAST_DURATION_MS = 5000

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (type, message) => {
      const id = ++idRef.current
      setToasts((prev) => [...prev, { id, type, message }])
      setTimeout(() => remove(id), TOAST_DURATION_MS)
    },
    [remove]
  )

  const showSuccess = useCallback((message) => push('success', message), [push])
  const showError = useCallback((message) => push('error', message), [push])

  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      {children}
      <ToastContainer toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider')
  }
  return context
}

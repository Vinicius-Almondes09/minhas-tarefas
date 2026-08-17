import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layout/AuthLayout'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { validateEmail } from '../utils/validators'
import { USE_MOCK } from '../config/env'

export default function LoginPage() {
  const { login } = useAuth()
  const { showError } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname ?? '/tarefas'

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = {}
    if (!validateEmail(form.email)) validationErrors.email = 'Informe um e-mail válido.'
    if (!form.password) validationErrors.password = 'Informe sua senha.'
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Entrar no TaskFlow" subtitle="Acesse sua conta para gerenciar suas tarefas.">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Input
          label="E-mail"
          name="email"
          type="email"
          placeholder="voce@exemplo.com"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
          autoFocus
        />

        <Input
          label="Senha"
          name="password"
          type="password"
          placeholder="Sua senha"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
        />

        <Button type="submit" variant="primary" size="lg" className="btn-block" loading={loading}>
          Entrar
        </Button>
      </form>

      <p className="auth-switch">
        Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link>
      </p>

      {USE_MOCK && (
        <p className="auth-demo">
          💡 Modo demonstração ativo — use a conta demo:
          <br />
          <strong>demo@taskflow.com</strong> / senha <strong>123456</strong>
        </p>
      )}
    </AuthLayout>
  )
}

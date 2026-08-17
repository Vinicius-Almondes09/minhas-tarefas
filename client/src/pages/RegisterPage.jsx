import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layout/AuthLayout'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { validateEmail } from '../utils/validators'

export default function RegisterPage() {
  const { register } = useAuth()
  const { showError, showSuccess } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = {}
    if (!validateEmail(form.email)) validationErrors.email = 'Informe um e-mail válido.'
    if (!form.password) validationErrors.password = 'A senha deve ter pelo menos 6 caracteres.'
    else if (form.password.length < 6) validationErrors.password = 'A senha deve ter pelo menos 6 caracteres.'
    if (form.confirmPassword !== form.password) validationErrors.confirmPassword = 'As senhas não coincidem.'
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setLoading(true)
    try {
      await register(form.email, form.password)
      showSuccess('Conta criada com sucesso! Bem-vindo(a) ao TaskFlow.')
      navigate('/tarefas', { replace: true })
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Criar conta" subtitle="Cadastre-se para começar a organizar suas tarefas.">
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
          placeholder="Mínimo de 6 caracteres"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
        />

        <Input
          label="Confirmar senha"
          name="confirmPassword"
          type="password"
          placeholder="Repita sua senha"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <Button type="submit" variant="primary" size="lg" className="btn-block" loading={loading}>
          Criar conta
        </Button>
      </form>

      <p className="auth-switch">
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </AuthLayout>
  )
}

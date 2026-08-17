// Autenticação fictícia (modo demonstração).
// Usuários são salvos no localStorage; o "token" guarda o id do usuário logado.

import { delay, generateId, MockError, getUsers, saveUsers, ensureDemoUser } from './mockHelpers'

const TOKEN_KEY = 'taskflow_token'

function currentUserId() {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  return token.replace('mock-token-', '')
}

export async function mockRegister(email, password) {
  await delay()

  const normalized = email.trim().toLowerCase()
  if (!normalized || !password) {
    throw new MockError('Informe e-mail e senha.')
  }
  if (password.length < 6) {
    throw new MockError('A senha deve ter pelo menos 6 caracteres.')
  }

  ensureDemoUser()
  const users = getUsers()

  if (users.some((u) => u.email === normalized)) {
    throw new MockError('Já existe uma conta com este e-mail.', 409)
  }

  const user = { id: generateId(), email: normalized, password }
  users.push(user)
  saveUsers(users)

  localStorage.setItem(TOKEN_KEY, `mock-token-${user.id}`)
  return { id: user.id, email: user.email }
}

export async function mockLogin(email, password) {
  await delay()

  const normalized = email.trim().toLowerCase()
  ensureDemoUser()
  const users = getUsers()

  const user = users.find((u) => u.email === normalized)
  if (!user || user.password !== password) {
    throw new MockError('E-mail ou senha incorretos.', 401)
  }

  localStorage.setItem(TOKEN_KEY, `mock-token-${user.id}`)
  return { id: user.id, email: user.email }
}

export async function mockFetchCurrentUser() {
  await delay()

  const id = currentUserId()
  if (!id) throw new MockError('Sessão expirada. Faça login novamente.', 401)

  ensureDemoUser()
  const user = getUsers().find((u) => u.id === id)
  if (!user) throw new MockError('Usuário não encontrado.', 401)

  return { id: user.id, email: user.email }
}

export function mockLogout() {
  localStorage.removeItem(TOKEN_KEY)
}

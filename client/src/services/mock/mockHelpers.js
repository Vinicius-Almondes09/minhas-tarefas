// ============================================================
// MODO DEMONSTRAÇÃO (mock)
// ============================================================
// Implementações fictícias de autenticação e tarefas que usam o
// localStorage do navegador. Servem para visualizar e testar toda
// a interface sem precisar do backend.
//
// Para desligar: VITE_USE_MOCK=false no arquivo .env do client.

// Simula latência de rede para reproduzir o comportamento real da API.
const DELAY_MS = 250

export function delay() {
  return new Promise((resolve) => setTimeout(resolve, DELAY_MS))
}

export function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export class MockError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// ------------------------------------------------------------------
// Banco fictício: usuários
// ------------------------------------------------------------------
const USERS_KEY = 'taskflow_mock_users'

export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) ?? []
  } catch {
    return []
  }
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// Conta demo criada na primeira execução.
export function ensureDemoUser() {
  const users = getUsers()
  if (users.length === 0) {
    users.push({
      id: 'demo-user',
      email: 'demo@taskflow.com',
      password: '123456',
    })
    saveUsers(users)
  }
  return users
}

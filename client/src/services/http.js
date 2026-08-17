// Cliente HTTP base do frontend.
// Centraliza a URL da API, o token de autenticação e o tratamento de erros.
// Qualquer chamada à API passa por aqui.

import { API_URL } from '../config/env'

const TOKEN_KEY = 'taskflow_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// Extrai uma mensagem legível a partir da resposta de erro.
// O FastAPI costuma retornar { detail: "..." } ou { detail: [{ msg: "..." }] }
function extractErrorMessage(data) {
  if (!data) return 'Algo deu errado. Tente novamente.'
  if (typeof data.detail === 'string') return data.detail
  if (Array.isArray(data.detail)) {
    return data.detail.map((item) => item.msg ?? 'Campo inválido.').join(' ')
  }
  if (typeof data.message === 'string') return data.message
  if (typeof data.mensagem === 'string') return data.mensagem
  return 'Algo deu errado. Tente novamente.'
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken()

  const config = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (body !== undefined) {
    config.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(`${API_URL}${path}`, config)
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.', 0)
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(data), response.status, data)
  }

  return data
}

export const http = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

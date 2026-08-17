// Serviço de autenticação.
//
// Contrato com o backend (FastAPI):
//   POST   /auth/register  { email, password }        -> { access_token, user }
//   POST   /auth/login     { email, password }         -> { access_token, user }
//   GET    /auth/me        (Authorization: Bearer)     -> { id, email }
//
// ⚡ COMO CONECTAR AO SUPABASE DEPOIS:
// Instale o cliente oficial e troque as funções abaixo por chamadas diretas:
//
//   import { createClient } from '@supabase/supabase-js'
//   export const supabase = createClient(
//     import.meta.env.VITE_SUPABASE_URL,
//     import.meta.env.VITE_SUPABASE_ANON_KEY
//   )
//
//   login:    supabase.auth.signInWithPassword({ email, password })
//   register: supabase.auth.signUp({ email, password })
//   logout:   supabase.auth.signOut()
//   /me:      supabase.auth.getUser()
//
// O resto da aplicação (contexto, páginas) não muda: ele só chama
// as funções exportadas aqui.

import { http, setToken, clearToken } from './http'
import { USE_MOCK } from '../config/env'
import { mockLogin, mockRegister, mockFetchCurrentUser, mockLogout } from './mock/mockAuth'

export async function login(email, password) {
  if (USE_MOCK) return mockLogin(email, password)

  const data = await http.post('/auth/login', { email, password })
  setToken(data.access_token)
  return data.user
}

export async function register(email, password) {
  if (USE_MOCK) return mockRegister(email, password)

  const data = await http.post('/auth/register', { email, password })
  // Alguns fluxos (ex.: confirmação de e-mail ativa no Supabase) não retornam token.
  if (data.access_token) setToken(data.access_token)
  return data.user
}

export async function fetchCurrentUser() {
  if (USE_MOCK) return mockFetchCurrentUser()
  return http.get('/auth/me')
}

export function logout() {
  if (USE_MOCK) return mockLogout()
  clearToken()
}

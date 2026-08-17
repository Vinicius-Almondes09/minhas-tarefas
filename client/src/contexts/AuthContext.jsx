import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as authService from '../services/auth'
import { getToken, clearToken } from '../services/http'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Ao abrir o app, tenta restaurar a sessão se existir um token salvo.
  useEffect(() => {
    let active = true

    async function restoreSession() {
      if (!getToken()) {
        setLoading(false)
        return
      }
      try {
        const currentUser = await authService.fetchCurrentUser()
        if (active) setUser(currentUser)
      } catch {
        clearToken()
      } finally {
        if (active) setLoading(false)
      }
    }

    restoreSession()
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const loggedUser = await authService.login(email, password)
    setUser(loggedUser)
    return loggedUser
  }, [])

  const register = useCallback(async (email, password) => {
    const newUser = await authService.register(email, password)
    setUser(newUser)
    return newUser
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

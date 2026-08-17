// Funções auxiliares de data.

export function todayISO() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

// Aceita datas no formato ISO (YYYY-MM-DD ou datetime completo)
export function formatDate(iso) {
  if (!iso) return '—'
  const value = iso.length === 10 ? `${iso}T00:00:00` : iso
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('pt-BR')
}

export function isPastDate(iso) {
  if (!iso) return false
  const value = iso.length === 10 ? `${iso}T00:00:00` : iso
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  return date < new Date()
}

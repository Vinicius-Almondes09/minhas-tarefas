// Filtragem e ordenação da lista de tarefas (função pura, fácil de testar).

import { PRIORIDADE_PESO } from './constants'

const SORT_KEY = {
  data_limite: (t) => t.data_limite ?? '9999-12-31',
  prioridade: (t) => PRIORIDADE_PESO[t.prioridade] ?? 0,
  criacao: (t) => t.criada_em ?? '',
}

export function filterAndSortTasks(tasks, filters) {
  const search = (filters.search ?? '').trim().toLowerCase()

  const filtered = tasks.filter((task) => {
    if (filters.priority && filters.priority !== 'todas' && task.prioridade !== filters.priority) return false
    if (filters.status && filters.status !== 'todos' && task.status !== filters.status) return false
    if (search && !(task.titulo ?? '').toLowerCase().includes(search)) return false
    return true
  })

  const sortKey = SORT_KEY[filters.sort] ?? SORT_KEY.data_limite

  return [...filtered].sort((a, b) => {
    if (filters.sort === 'prioridade') {
      const diff = sortKey(b) - sortKey(a)
      if (diff !== 0) return diff
      return String(a.data_limite ?? '').localeCompare(String(b.data_limite ?? ''))
    }
    if (filters.sort === 'criacao') {
      return String(b.criada_em ?? '').localeCompare(String(a.criada_em ?? ''))
    }
    return String(sortKey(a)).localeCompare(String(sortKey(b)))
  })
}

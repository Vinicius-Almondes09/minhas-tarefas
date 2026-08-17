// Valores fixos do domínio: prioridades e status das tarefas.
// Ficam centralizados aqui para serem reutilizados em formulários, filtros e badges.

export const PRIORIDADES = [
  { value: 'baixa', label: 'Baixa', badge: 'success' },
  { value: 'media', label: 'Média', badge: 'warning' },
  { value: 'alta', label: 'Alta', badge: 'danger' },
]

export const STATUS = [
  { value: 'pendente', label: 'Pendente', badge: 'neutral' },
  { value: 'em_andamento', label: 'Em andamento', badge: 'info' },
  { value: 'concluida', label: 'Concluída', badge: 'success' },
]

// Opções para os filtros (incluem a opção "todas/todos")
export const PRIORIDADE_FILTROS = [{ value: 'todas', label: 'Todas as prioridades' }, ...PRIORIDADES]
export const STATUS_FILTROS = [{ value: 'todos', label: 'Todos os status' }, ...STATUS]

export const SORT_OPTIONS = [
  { value: 'data_limite', label: 'Ordenar por data limite' },
  { value: 'prioridade', label: 'Ordenar por prioridade' },
  { value: 'criacao', label: 'Mais recentes primeiro' },
]

// Ordem usada para ordenar por prioridade (maior = mais importante)
export const PRIORIDADE_PESO = { alta: 3, media: 2, baixa: 1 }

export function getPrioridade(value) {
  return PRIORIDADES.find((p) => p.value === value) ?? PRIORIDADES[1]
}

export function getStatus(value) {
  return STATUS.find((s) => s.value === value) ?? STATUS[0]
}

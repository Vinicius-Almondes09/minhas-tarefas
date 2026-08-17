// Tarefas fictícias (modo demonstração).
// Cada usuário tem sua própria lista, isolada no localStorage.

import { delay, generateId, MockError } from './mockHelpers'

function storageKey(userId) {
  return `taskflow_mock_tasks_${userId}`
}

function currentUserId() {
  const token = localStorage.getItem('taskflow_token')
  if (!token) return null
  return token.replace('mock-token-', '')
}

function requireUserId() {
  const userId = currentUserId()
  if (!userId) throw new MockError('Sessão expirada. Faça login novamente.', 401)
  return userId
}

function loadTasks(userId) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(userId))) ?? []
  } catch {
    return []
  }
}

function saveTasks(userId, tasks) {
  localStorage.setItem(storageKey(userId), JSON.stringify(tasks))
}

function seedTasks(userId, tasks) {
  if (tasks.length === 0) {
    const hoje = new Date().toISOString().slice(0, 10)
    const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const seed = [
      {
        id: generateId(),
        titulo: 'Estudar para a prova de Sistemas Distribuídos',
        descricao: 'Revisar os capítulos sobre arquitetura cliente-servidor e RPC.',
        data_limite: amanha,
        prioridade: 'alta',
        status: 'em_andamento',
        criada_em: new Date().toISOString(),
      },
      {
        id: generateId(),
        titulo: 'Organizar o repositório do projeto',
        descricao: 'Separar as pastas client/ e server/ e atualizar o README.',
        data_limite: hoje,
        prioridade: 'media',
        status: 'pendente',
        criada_em: new Date().toISOString(),
      },
      {
        id: generateId(),
        titulo: 'Ler o artigo da aula',
        descricao: '',
        data_limite: '2026-08-30',
        prioridade: 'baixa',
        status: 'pendente',
        criada_em: new Date().toISOString(),
      },
    ]
    saveTasks(userId, seed)
    return seed
  }
  return tasks
}

export async function mockListTasks() {
  await delay()
  const userId = requireUserId()
  return seedTasks(userId, loadTasks(userId))
}

export async function mockCreateTask(task) {
  await delay()
  const userId = requireUserId()

  const nova = {
    ...task,
    id: generateId(),
    titulo: task.titulo.trim(),
    criada_em: new Date().toISOString(),
  }

  const tasks = loadTasks(userId)
  tasks.unshift(nova)
  saveTasks(userId, tasks)
  return nova
}

export async function mockUpdateTask(id, changes) {
  await delay()
  const userId = requireUserId()

  const tasks = loadTasks(userId)
  const index = tasks.findIndex((t) => t.id === id)
  if (index === -1) throw new MockError('Tarefa não encontrada.', 404)

  const atualizada = { ...tasks[index], ...changes, titulo: (changes.titulo ?? tasks[index].titulo).trim() }
  tasks[index] = atualizada
  saveTasks(userId, tasks)
  return atualizada
}

export async function mockDeleteTask(id) {
  await delay()
  const userId = requireUserId()

  const tasks = loadTasks(userId)
  const remaining = tasks.filter((t) => t.id !== id)
  if (remaining.length === tasks.length) throw new MockError('Tarefa não encontrada.', 404)

  saveTasks(userId, remaining)
  return { mensagem: 'Tarefa excluída com sucesso.' }
}

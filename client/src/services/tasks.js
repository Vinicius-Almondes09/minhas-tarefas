// Serviço de tarefas (CRUD).
//
// Contrato com o backend (FastAPI) — todas as rotas exigem token Bearer:
//   GET    /tasks          -> { tasks: [...] }
//   POST   /tasks          -> tarefa criada
//   PATCH  /tasks/:id      -> tarefa atualizada
//   DELETE /tasks/:id      -> { mensagem: "..." }
//
// Formato da tarefa:
//   {
//     id, titulo, descricao, data_limite (YYYY-MM-DD),
//     prioridade ("baixa" | "media" | "alta"),
//     status ("pendente" | "em_andamento" | "concluida"),
//     criada_em (ISO datetime)
//   }
//
// ⚡ Para conectar o Supabase direto no frontend, basta trocar as
// implementações abaixo por consultas do supabase-js (supabase.from('tasks')...).

import { http } from './http'
import { USE_MOCK } from '../config/env'
import { mockListTasks, mockCreateTask, mockUpdateTask, mockDeleteTask } from './mock/mockTasks'

export async function listTasks() {
  if (USE_MOCK) return mockListTasks()

  const data = await http.get('/tasks')
  return data.tasks ?? data
}

export async function createTask(task) {
  if (USE_MOCK) return mockCreateTask(task)
  return http.post('/tasks', task)
}

export async function updateTask(id, task) {
  if (USE_MOCK) return mockUpdateTask(id, task)
  return http.patch(`/tasks/${id}`, task)
}

export async function deleteTask(id) {
  if (USE_MOCK) return mockDeleteTask(id)
  return http.delete(`/tasks/${id}`)
}

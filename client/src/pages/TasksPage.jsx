import { useState } from 'react'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Alert from '../components/ui/Alert'
import Spinner from '../components/ui/Spinner'
import TaskFilters from '../components/tasks/TaskFilters'
import TaskList from '../components/tasks/TaskList'
import TaskForm from '../components/tasks/TaskForm'
import EmptyState from '../components/ui/EmptyState'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useTasks } from '../hooks/useTasks'

export default function TasksPage() {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const { tasks, filteredTasks, loading, error, filters, setFilters, reload, addTask, editTask, removeTask } =
    useTasks()

  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function openCreate() {
    setEditingTask(null)
    setFormOpen(true)
  }

  function openEdit(task) {
    setEditingTask(task)
    setFormOpen(true)
  }

  async function handleSubmit(values) {
    setSaving(true)
    try {
      if (editingTask) {
        await editTask(editingTask.id, values)
        showSuccess('Tarefa atualizada com sucesso!')
      } else {
        await addTask(values)
        showSuccess('Tarefa criada com sucesso!')
      }
      setFormOpen(false)
      setEditingTask(null)
    } catch (err) {
      showError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingTask) return
    setDeleting(true)
    try {
      await removeTask(deletingTask.id)
      showSuccess('Tarefa excluída com sucesso!')
      setDeletingTask(null)
    } catch (err) {
      showError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Layout>
      <div className="tasks-header">
        <div>
          <h1>Minhas tarefas</h1>
          <p className="page-subtitle">Olá, {user?.email} — organize suas atividades por aqui.</p>
        </div>
        <Button onClick={openCreate}>+ Nova tarefa</Button>
      </div>

      {tasks.length > 0 && (
        <TaskFilters filters={filters} onChange={setFilters} total={filteredTasks.length} />
      )}

      {loading ? (
        <div className="tasks-loading">
          <Spinner /> Carregando tarefas...
        </div>
      ) : error ? (
        <Alert variant="error">
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={reload}>
            Tentar novamente
          </Button>
        </Alert>
      ) : filteredTasks.length === 0 ? (
        tasks.length === 0 ? (
          <EmptyState
            icon="🗒️"
            title="Nenhuma tarefa por aqui"
            description="Crie sua primeira tarefa para começar a organizar suas atividades."
            action={
              <Button onClick={openCreate}>+ Nova tarefa</Button>
            }
          />
        ) : (
          <EmptyState
            icon="🔍"
            title="Nenhum resultado encontrado"
            description="Ajuste os filtros ou o termo de busca para encontrar suas tarefas."
          />
        )
      ) : (
        <TaskList tasks={filteredTasks} onEdit={openEdit} onDelete={setDeletingTask} onNewTask={openCreate} />
      )}

      <Modal
        open={formOpen}
        title={editingTask ? 'Editar tarefa' : 'Nova tarefa'}
        onClose={() => setFormOpen(false)}
      >
        <TaskForm
          key={editingTask?.id ?? 'nova'}
          initialValues={editingTask}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          saving={saving}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingTask)}
        title="Excluir tarefa"
        message={`Tem certeza que deseja excluir a tarefa "${deletingTask?.titulo}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onClose={() => setDeletingTask(null)}
        loading={deleting}
      />
    </Layout>
  )
}

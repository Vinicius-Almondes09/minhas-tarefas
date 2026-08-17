import TaskCard from './TaskCard'
import EmptyState from '../ui/EmptyState'

export default function TaskList({ tasks, onEdit, onDelete, onNewTask }) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon="🗒️"
        title="Nenhuma tarefa por aqui"
        description="Crie sua primeira tarefa para começar a organizar suas atividades."
        action={
          <button type="button" className="btn btn-primary" onClick={onNewTask}>
            + Nova tarefa
          </button>
        }
      />
    )
  }

  return (
    <div className="task-grid">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}

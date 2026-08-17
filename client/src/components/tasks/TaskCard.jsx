import Badge from '../ui/Badge'
import { getPrioridade, getStatus } from '../../utils/constants'
import { formatDate, isPastDate } from '../../utils/date'

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

export default function TaskCard({ task, onEdit, onDelete }) {
  const prioridade = getPrioridade(task.prioridade)
  const status = getStatus(task.status)
  const overdue = isPastDate(task.data_limite) && task.status !== 'concluida'

  return (
    <article className={`task-card ${overdue ? 'is-overdue' : ''}`}>
      <div className="task-card-top">
        <h3>{task.titulo}</h3>
        <div className="task-card-actions">
          <button type="button" className="icon-btn" onClick={() => onEdit(task)} title="Editar tarefa" aria-label={`Editar tarefa ${task.titulo}`}>
            <EditIcon />
          </button>
          <button type="button" className="icon-btn danger" onClick={() => onDelete(task)} title="Excluir tarefa" aria-label={`Excluir tarefa ${task.titulo}`}>
            <TrashIcon />
          </button>
        </div>
      </div>

      {task.descricao && <p className="task-card-desc">{task.descricao}</p>}

      <div className="task-card-meta">
        <Badge variant={prioridade.badge}>{prioridade.label}</Badge>
        <Badge variant={status.badge}>{status.label}</Badge>
        <span className={`task-card-date ${overdue ? 'is-overdue' : ''}`}>
          📅 {formatDate(task.data_limite)}
          {overdue && ' · Atrasada'}
        </span>
      </div>
    </article>
  )
}

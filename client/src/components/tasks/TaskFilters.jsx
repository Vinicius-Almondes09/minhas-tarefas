import Input from '../ui/Input'
import Select from '../ui/Select'
import { PRIORIDADE_FILTROS, STATUS_FILTROS, SORT_OPTIONS } from '../../utils/constants'

export default function TaskFilters({ filters, onChange, total }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="task-filters">
      <Input
        type="search"
        className="input-search"
        placeholder="Buscar por título..."
        value={filters.search}
        onChange={(event) => update('search', event.target.value)}
        aria-label="Buscar tarefas"
      />

      <Select
        value={filters.priority}
        onChange={(event) => update('priority', event.target.value)}
        options={PRIORIDADE_FILTROS}
        aria-label="Filtrar por prioridade"
      />

      <Select
        value={filters.status}
        onChange={(event) => update('status', event.target.value)}
        options={STATUS_FILTROS}
        aria-label="Filtrar por status"
      />

      <Select
        value={filters.sort}
        onChange={(event) => update('sort', event.target.value)}
        options={SORT_OPTIONS}
        aria-label="Ordenar tarefas"
      />

      <span className="task-filters-count">
        {total} {total === 1 ? 'tarefa' : 'tarefas'}
      </span>
    </div>
  )
}

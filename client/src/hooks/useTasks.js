import { useCallback, useEffect, useMemo, useState } from 'react'
import * as taskService from '../services/tasks'
import { filterAndSortTasks } from '../utils/filters'

const FILTROS_INICIAIS = {
  search: '',
  priority: 'todas',
  status: 'todos',
  sort: 'data_limite',
}

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(FILTROS_INICIAIS)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await taskService.listTasks()
      setTasks(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const filteredTasks = useMemo(() => filterAndSortTasks(tasks, filters), [tasks, filters])

  const addTask = useCallback(async (task) => {
    const created = await taskService.createTask(task)
    setTasks((prev) => [created, ...prev])
    return created
  }, [])

  const editTask = useCallback(async (id, task) => {
    const updated = await taskService.updateTask(id, task)
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    return updated
  }, [])

  const removeTask = useCallback(async (id) => {
    await taskService.deleteTask(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return {
    tasks,
    filteredTasks,
    loading,
    error,
    filters,
    setFilters,
    reload: loadTasks,
    addTask,
    editTask,
    removeTask,
  }
}

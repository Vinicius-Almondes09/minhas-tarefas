import { useEffect, useState } from 'react'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { PRIORIDADES, STATUS } from '../../utils/constants'
import { validateTask } from '../../utils/validators'
import { todayISO } from '../../utils/date'

const FORM_VAZIO = {
  titulo: '',
  descricao: '',
  data_limite: '',
  prioridade: 'media',
  status: 'pendente',
}

export default function TaskForm({ initialValues = null, onSubmit, onCancel, saving = false }) {
  const [form, setForm] = useState(FORM_VAZIO)
  const [errors, setErrors] = useState({})

  // Preenche o formulário ao abrir para edição.
  useEffect(() => {
    if (initialValues) {
      setForm({
        titulo: initialValues.titulo ?? '',
        descricao: initialValues.descricao ?? '',
        data_limite: initialValues.data_limite ?? '',
        prioridade: initialValues.prioridade ?? 'media',
        status: initialValues.status ?? 'pendente',
      })
    } else {
      setForm(FORM_VAZIO)
    }
    setErrors({})
  }, [initialValues])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validateTask(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return
    onSubmit({
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim(),
      data_limite: form.data_limite,
      prioridade: form.prioridade,
      status: form.status,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Input
        label="Título *"
        name="titulo"
        placeholder="Ex.: Estudar para a prova"
        value={form.titulo}
        onChange={handleChange}
        error={errors.titulo}
        maxLength={120}
        autoFocus
      />

      <Textarea
        label="Descrição"
        name="descricao"
        placeholder="Detalhes da tarefa (opcional)"
        value={form.descricao}
        onChange={handleChange}
        error={errors.descricao}
        maxLength={500}
      />

      <Input
        label="Data limite *"
        name="data_limite"
        type="date"
        value={form.data_limite}
        onChange={handleChange}
        error={errors.data_limite}
        min={todayISO()}
      />

      <div className="field-row">
        <Select
          label="Prioridade *"
          name="prioridade"
          value={form.prioridade}
          onChange={handleChange}
          options={PRIORIDADES}
          error={errors.prioridade}
        />
        <Select
          label="Status *"
          name="status"
          value={form.status}
          onChange={handleChange}
          options={STATUS}
          error={errors.status}
        />
      </div>

      <div className="modal-footer">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          {initialValues ? 'Salvar alterações' : 'Criar tarefa'}
        </Button>
      </div>
    </form>
  )
}

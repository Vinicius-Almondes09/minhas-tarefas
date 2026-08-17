// Validações simples de formulário (sem dependências externas).

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email ?? '')
}

// Valida os campos de uma tarefa. Retorna um objeto de erros (vazio = válido).
export function validateTask({ titulo, descricao, data_limite, prioridade, status }) {
  const errors = {}

  if (!titulo || !titulo.trim()) {
    errors.titulo = 'Informe o título da tarefa.'
  } else if (titulo.trim().length > 120) {
    errors.titulo = 'O título deve ter no máximo 120 caracteres.'
  }

  if (descricao && descricao.trim().length > 500) {
    errors.descricao = 'A descrição deve ter no máximo 500 caracteres.'
  }

  if (!data_limite) {
    errors.data_limite = 'Informe a data limite.'
  }

  if (!prioridade) {
    errors.prioridade = 'Selecione a prioridade.'
  }

  if (!status) {
    errors.status = 'Selecione o status.'
  }

  return errors
}

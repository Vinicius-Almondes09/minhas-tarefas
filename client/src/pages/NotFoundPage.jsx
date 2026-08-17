import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="container">
      <div className="not-found">
        <h1>404</h1>
        <p className="page-subtitle">Página não encontrada.</p>
        <Link to="/tarefas">
          <Button variant="primary">Voltar para minhas tarefas</Button>
        </Link>
      </div>
    </div>
  )
}

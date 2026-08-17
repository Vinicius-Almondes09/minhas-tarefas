import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../ui/Button'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <Link to="/tarefas" className="brand">
          <span className="brand-icon" aria-hidden="true">✓</span>
          TaskFlow
        </Link>

        <div className="navbar-right">
          <span className="navbar-user" title={user?.email}>
            {user?.email}
          </span>
          <Button variant="ghost" size="sm" onClick={logout}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  )
}

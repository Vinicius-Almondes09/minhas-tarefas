// Configurações globais do frontend.
// As variáveis são lidas de variáveis de ambiente do Vite (arquivo .env na raiz do client).

// URL base da API REST (backend FastAPI).
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

// Modo demonstração: usa dados fictícios no navegador (localStorage)
// em vez de chamar a API. Defina VITE_USE_MOCK=false quando o backend estiver pronto.
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

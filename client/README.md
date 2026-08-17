# TaskFlow — Frontend (React + Vite)

Interface web do sistema de gerenciamento de tarefas. O frontend se comunica
com a API REST (FastAPI) em `server/`, que por sua vez usa o Supabase como
banco de dados e autenticação.

## Requisitos

- Node.js 18+
- npm

## Como executar

```bash
cd client
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`.

### Modo demonstração (sem backend)

Por padrão, o arquivo `.env` ativa `VITE_USE_MOCK=true`, que usa dados fictícios
salvos no navegador (localStorage). Assim é possível ver toda a interface
funcionando sem precisar do servidor:

- Conta demo: **demo@taskflow.com** / senha **123456**

Quando o backend estiver pronto, troque para:

```env
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:8000
```

> Dica: as variáveis possíveis estão documentadas em `.env.example`.

## Estrutura do projeto

```
client/
├── index.html
├── .env.example            # variáveis de ambiente documentadas
├── public/
└── src/
    ├── main.jsx            # ponto de entrada (providers + rotas)
    ├── App.jsx             # definição das rotas
    ├── index.css           # design system (cores, botões, modais, etc.)
    ├── config/
    │   └── env.js          # leitura central de variáveis de ambiente
    ├── services/           # ⚡ camada de serviços (trocar p/ Supabase aqui)
    │   ├── http.js         # cliente HTTP (URL, token Bearer, erros)
    │   ├── auth.js         # login, cadastro, sessão
    │   ├── tasks.js        # CRUD de tarefas
    │   └── mock/           # implementações fictícias (modo demonstração)
    ├── contexts/
    │   ├── AuthContext.jsx # sessão do usuário logado
    │   └── ToastContext.jsx# mensagens de sucesso/erro (toasts)
    ├── hooks/
    │   └── useTasks.js     # estado, filtros e operações de tarefas
    ├── utils/
    │   ├── constants.js    # prioridades e status (fonte única)
    │   ├── validators.js   # validação de formulários
    │   ├── filters.js      # filtro/ordenação (função pura)
    │   └── date.js         # formatação de datas
    ├── components/
    │   ├── ui/             # Button, Input, Select, Modal, Badge, Toast...
    │   ├── layout/         # Navbar, Layout, rotas protegidas
    │   └── tasks/          # TaskCard, TaskForm, TaskFilters, TaskList
    └── pages/
        ├── LoginPage.jsx
        ├── RegisterPage.jsx
        ├── TasksPage.jsx
        └── NotFoundPage.jsx
```

## Contrato com a API (FastAPI)

O frontend espera os seguintes endpoints (todas as rotas de tarefas exigem
`Authorization: Bearer <token>`):

| Método | Rota           | Corpo / Resposta                                     |
| ------ | -------------- | ---------------------------------------------------- |
| POST   | `/auth/register` | `{ email, password }` → `{ access_token, user }`   |
| POST   | `/auth/login`    | `{ email, password }` → `{ access_token, user }`   |
| GET    | `/auth/me`       | → `{ id, email }`                                   |
| GET    | `/tasks`         | → `{ tasks: [...] }`                                |
| POST   | `/tasks`         | `{ titulo, descricao, data_limite, prioridade, status }` → tarefa criada |
| PATCH  | `/tasks/:id`     | campos parciais → tarefa atualizada                   |
| DELETE | `/tasks/:id`     | → `{ mensagem: "..." }`                             |

Formato da tarefa:

```js
{
  id: "uuid",
  titulo: "string",
  descricao: "string",
  data_limite: "YYYY-MM-DD",
  prioridade: "baixa" | "media" | "alta",
  status: "pendente" | "em_andamento" | "concluida",
  criada_em: "ISO datetime"
}
```

Erros do FastAPI (`{ detail: "..." }`) são exibidos automaticamente como
mensagens de erro na interface.

## Conectando ao Supabase

A arquitetura pedida no trabalho é `React → FastAPI → Supabase`, então o
caminho recomendado é:

1. Manter o frontend chamando a API FastAPI (como está agora);
2. No **backend**, usar o `supabase-py` para autenticação e Postgres.

Caso prefira usar o **Supabase direto no frontend** (supabase-js), os únicos
pontos de troca são `src/services/auth.js` e `src/services/tasks.js` — ambos já
possuem comentários explicando como substituir as funções por chamadas do
`supabase.auth` e `supabase.from('tasks')`. O restante da aplicação (páginas,
contextos, componentes) não precisa mudar.

### Passos para o backend

1. Crie o projeto no [Supabase](https://supabase.com) e guarde a URL e a chave
   `service_role` (ou `anon` com RLS bem configurado);
2. Configure as variáveis no `server/.env` (veja o README de `server/`);
3. Crie a tabela `tasks` com colunas: `id (uuid)`, `user_id (uuid, FK)`,
   `titulo`, `descricao`, `data_limite (date)`, `prioridade`,
   `status`, `criada_em (timestamptz)`;
4. Ative o RLS (Row Level Security) para que cada usuário veja apenas as
   próprias tarefas (`auth.uid() = user_id`);
5. Implemente os endpoints do contrato acima.

## Scripts

| Comando              | Descrição                             |
| -------------------- | ------------------------------------- |
| `npm run dev`        | ambiente de desenvolvimento           |
| `npm run build`      | build de produção em `dist/`          |
| `npm run preview`    | pré-visualiza o build de produção     |

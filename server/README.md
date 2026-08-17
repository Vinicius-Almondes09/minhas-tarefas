# TaskFlow — Backend (FastAPI + Supabase)

API REST do sistema de gerenciamento de tarefas. O backend é responsável
pela autenticação (via Supabase Auth) e pelas operações de CRUD de tarefas,
persistidas no PostgreSQL do Supabase com RLS (Row Level Security).

## Requisitos

- Python 3.10+
- Conta gratuita no [Supabase](https://supabase.com) (projeto criado)

## Configuração do Supabase (uma vez)

Siga o guia completo em [`docs/setup-supabase.md`](../docs/setup-supabase.md),
que cobre: criação do projeto, desativação da confirmação de e-mail, obtenção
as credenciais, criação da tabela com RLS e conexão do frontend.

Resumo rápido:

1. Crie o projeto no Supabase e copie a **URL** e a chave **anon (public)**
   em *Project Settings → API*;
2. No SQL Editor, execute o script [`schema.sql`](schema.sql) — ele cria a
   tabela `tasks` e ativa o RLS para que cada usuário veja apenas as próprias
   tarefas;
3. Para o cadastro retornar a sessão imediatamente, desative a confirmação
   de e-mail: *Authentication → Providers → Email → Confirm email* (off).
   Sem isso, o cadastro cria a conta, mas é preciso confirmar o e-mail
   antes do primeiro login.

## Instalação e execução

```bash
cd server
python -m venv venv

# Linux/macOS:
source venv/bin/activate
# Windows:
venv\Scripts\activate

pip install -r requirements.txt

# Configure as credenciais do Supabase
cp .env.example .env   # edite com SUPABASE_URL e SUPABASE_ANON_KEY

uvicorn main:app --reload
```

A API fica em `http://localhost:8000` (docs interativas em `/docs`).
O frontend (React) já está configurado com `VITE_API_URL=http://localhost:8000`
no arquivo `client/.env`.

## Executando os testes

```bash
cd server
venv\Scripts\activate        # se ainda não estiver ativo
pytest -v
```

> Os testes **não** precisam de uma conta Supabase: eles substituem o
> cliente por uma implementação fictícia (`tests/fakes.py`) que emula a
> autenticação e o RLS em memória.

São **23 testes**, agrupados em:

| Grupo                | Arquivo             | O que valida                                                                 |
| -------------------- | ------------------- | ---------------------------------------------------------------------------- |
| Autenticação         | `tests/test_auth.py`| Cadastro, login, sessão (`/auth/me`) e rejeição de token ausente/inválido    |
| Criação (POST)       | `tests/test_tasks.py`| Cria tarefa e valida payload (título obrigatório, prioridade válida)         |
| Listagem (GET)       | `tests/test_tasks.py`| Lista tarefas do usuário (inclusive lista vazia)                             |
| Atualização (PATCH)  | `tests/test_tasks.py`| Atualiza campos parciais e retorna 404 para tarefa inexistente               |
| Exclusão (DELETE)    | `tests/test_tasks.py`| Exclui tarefa e retorna 404 para tarefa inexistente                          |
| Isolamento de contas | `tests/test_tasks.py`| Um usuário não vê/atualiza/exclui tarefas de outro                           |

## Estrutura do projeto

```
server/
├── main.py                 # aplicação FastAPI (CORS + rotas + erros)
├── requirements.txt
├── schema.sql              # tabela tasks + RLS (rodar no SQL Editor)
├── .env.example
├── app/
│   ├── config.py           # leitura das variáveis de ambiente
│   ├── schemas.py          # modelos Pydantic (contrato da API)
│   ├── dependencies.py     # autenticação e clientes do Supabase
│   ├── routers/
│   │   ├── auth.py         # /auth/register, /auth/login, /auth/me
│   │   └── tasks.py        # CRUD de /tasks
│   └── services/
│       ├── supabase_client.py  # criação do cliente (com/sem token)
│       ├── auth_service.py     # delega autenticação ao Supabase Auth
│       └── task_service.py     # CRUD de tarefas (PostgREST)
└── tests/
    ├── conftest.py         # fixtures (cliente de teste + Supabase fake)
    ├── fakes.py            # implementação fictícia do Supabase
    ├── helpers.py          # funções auxiliares
    ├── test_auth.py
    └── test_tasks.py
```

## Contrato da API

| Método | Rota           | Descrição                                      |
| ------ | -------------- | ---------------------------------------------- |
| POST   | `/auth/register` | Cadastro `{ email, password }` → `{ access_token, user }` |
| POST   | `/auth/login`    | Login `{ email, password }` → `{ access_token, user }`    |
| GET    | `/auth/me`       | Usuário autenticado (Bearer) → `{ id, email }` |
| GET    | `/tasks`         | Lista tarefas do usuário → `{ tasks: [...] }`  |
| POST   | `/tasks`         | Cria tarefa (exige Bearer)                     |
| PATCH  | `/tasks/:id`     | Atualiza campos parciais (exige Bearer)        |
| DELETE | `/tasks/:id`     | Exclui tarefa (exige Bearer)                   |

Segurança: todas as rotas de tarefas exigem `Authorization: Bearer <token>`.
O token é validado no Supabase e as consultas são restritas ao `user_id` do
usuário autenticado — reforçado pelo RLS no banco.

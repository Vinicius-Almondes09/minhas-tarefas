# TaskFlow: sistema de gerenciamento de tarefas

## 1. Introdução

O TaskFlow é uma aplicação web para cadastro e organização de tarefas pessoais. O sistema permite criar, editar, excluir, filtrar e ordenar tarefas. Também possui cadastro e login de usuários.

O projeto foi desenvolvido como uma aplicação full-stack. No frontend foi utilizado React e, no backend, FastAPI. O Supabase é responsável pelo banco PostgreSQL e pela autenticação.

## 2. Tecnologias utilizadas

- **Frontend:** React 18, React Router e Vite
- **Backend:** Python, FastAPI, Uvicorn e Pydantic
- **Banco e autenticação:** Supabase, PostgreSQL e JWT
- **Testes:** pytest, httpx e TestClient do FastAPI

O frontend também possui um modo mock. Quando essa opção está ativada, os dados são salvos no `localStorage`, o que permite testar a interface sem configurar o Supabase.

## 3. Organização do projeto

O projeto está dividido em duas partes principais:

```text
taskflow/
├── client/        # Interface em React
├── server/        # API em FastAPI
├── docs/          # Instruções de configuração
└── README.md
```

No frontend, as páginas ficam separadas dos componentes reutilizáveis. Os serviços fazem a comunicação com a API, enquanto o hook `useTasks` concentra o estado e as operações relacionadas às tarefas.

No backend, as rotas recebem as requisições e chamam os serviços responsáveis pela autenticação e pelo CRUD de tarefas. Os schemas do Pydantic verificam os dados antes que eles sejam processados.

## 4. Funcionamento do frontend

As principais rotas da aplicação são:

| Rota | Função |
|---|---|
| `/login` | Entrada do usuário |
| `/cadastro` | Criação de uma conta |
| `/tarefas` | Lista e gerenciamento das tarefas |

A rota de tarefas é protegida. Ao abrir a aplicação, o `AuthContext` verifica se existe um token salvo. Se o token for válido, o usuário continua conectado; caso contrário, ele é enviado para a tela de login.

A página de tarefas usa o hook `useTasks`, que controla o carregamento, a criação, a edição e a exclusão dos registros. Os filtros são aplicados no próprio frontend por meio da busca, da prioridade, do status e da ordenação.

Foram criados componentes próprios para botões, campos de formulário, selects, mensagens, modais, avisos e cartões de tarefas. O CSS usa variáveis para cores, espaçamentos e tamanhos, além de regras para telas menores.

## 5. Funcionamento do backend

A API possui dois grupos de rotas:

### Autenticação

- `POST /auth/register`: cadastra um usuário;
- `POST /auth/login`: verifica os dados e retorna um token;
- `GET /auth/me`: retorna os dados do usuário autenticado.

### Tarefas

- `GET /tasks`: lista as tarefas do usuário;
- `POST /tasks`: cria uma tarefa;
- `PATCH /tasks/{id}`: atualiza uma tarefa;
- `DELETE /tasks/{id}`: exclui uma tarefa.

O token é enviado no cabeçalho `Authorization` como Bearer token. O backend valida esse token antes de liberar as rotas de tarefas. Os dados recebidos são validados pelos schemas, incluindo email, tamanho dos textos, prioridade, status e data limite.

## 6. Banco de dados e segurança

A tabela `tasks` possui os campos principais da tarefa, além do identificador do usuário e da data de criação. Os valores de prioridade e status também possuem restrições no banco.

O Supabase utiliza Row Level Security (RLS) para garantir que cada usuário veja apenas as próprias tarefas. O backend também filtra as consultas pelo `user_id`, criando uma segunda camada de proteção.

As principais medidas adotadas foram:

- autenticação por JWT;
- validação no frontend e no backend;
- restrições de valores no banco;
- isolamento das tarefas por usuário;
- CORS limitado às origens usadas no desenvolvimento.

Em uma versão de produção, as origens permitidas no CORS e o armazenamento do token deveriam ser revisados de acordo com a infraestrutura utilizada.

## 7. Testes

Foram escritos 23 testes automatizados para a API. Dez verificam a autenticação e treze verificam o gerenciamento de tarefas.

Entre os cenários testados estão:

- cadastro e login;
- email inválido e senha curta;
- credenciais incorretas;
- acesso sem token;
- criação, edição e exclusão de tarefas;
- dados obrigatórios ausentes;
- tarefa inexistente;
- isolamento entre usuários.

Os testes usam um banco falso em memória e substituem as dependências do Supabase. Assim, é possível testar as rotas sem depender de uma conexão externa.

## 8. Classificação do sistema distribuído

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CAMADA DE APRESENTAÇÃO                      │
│                        (React + Vite)                               │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │   Pages      │  │  Components  │  │       Services           │  │
│  │              │  │    (UI)      │  │                          │  │
│  │ • Login      │  │ • Button     │  │  ┌────────┐ ┌─────────┐  │  │
│  │ • Register   │  │ • Input      │  │  │  auth  │ │  tasks  │  │  │
│  │ • Tasks      │  │ • Select     │  │  │   .js  │ │   .js   │  │  │
│  │ • NotFound   │  │ • Modal      │  │  └───┬────┘ └────┬────┘  │  │
│  │              │  │ • Badge      │  │      │           │        │  │
│  └──────┬───────┘  │ • Toast      │  │  ┌───┴────┐ ┌────┴────┐  │  │
│         │          │ • EmptyState │  │  │  mock/ │ │ http.js │  │  │
│  ┌──────┴───────┐  └──────────────┘  │  │ (demo) │ │ (HTTP)  │  │  │
│  │  Contexts    │                    │  └────────┘ └────┬────┘  │  │
│  │              │  ┌──────────────┐  │                  │       │  │
│  │ • AuthCtx    │  │   Hooks      │  └──────────────────┼───────┘  │
│  │ • ToastCtx   │  │ • useTasks   │                     │          │
│  └──────┬───────┘  └──────────────┘                     │          │
│         │                                               │          │
│  ┌──────┴───────┐  ┌──────────────┐                     │          │
│  │    Utils     │  │    Config    │                     │          │
│  │ • constants  │  │ • env.js     │                     │          │
│  │ • filters    │  └──────────────┘                     │          │
│  │ • validators │                                       │          │
│  │ • date.js    │                                       │          │
│  └──────────────┘                                       │          │
└─────────────────────────────────────────┬───────────────┘          │
                                          │                          │
                                          │  HTTP REST (JSON)        │
                                          │  JWT Bearer Auth         │
                                          ▼                          │
┌─────────────────────────────────────────────────────────────────────┐
│                        CAMADA DE NEGÓCIO                           │
│                        (FastAPI + Python)                           │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      main.py (App)                           │   │
│  │              CORS + Rotas + Middleware de Erros              │   │
│  └───────────────────────────┬──────────────────────────────────┘   │
│                              │                                      │
│  ┌───────────────────────────┴──────────────────────────────────┐   │
│  │                    Routers (Endpoints)                       │   │
│  │                                                              │   │
│  │  ┌─────────────────┐      ┌──────────────────────────────┐  │   │
│  │  │   auth.py       │      │       tasks.py               │  │   │
│  │  │ POST /register  │      │ GET    /tasks                │  │   │
│  │  │ POST /login     │      │ POST   /tasks                │  │   │
│  │  │ GET  /me        │      │ PATCH  /tasks/:id            │  │   │
│  │  └────────┬────────┘      │ DELETE /tasks/:id            │  │   │
│  │           │               └──────────┬───────────────────┘  │   │
│  └───────────┼──────────────────────────┼───────────────────────┘   │
│              │                          │                           │
│  ┌───────────┴──────────────────────────┴───────────────────────┐   │
│  │                  Services (Lógica)                           │   │
│  │                                                              │   │
│  │  ┌─────────────────┐  ┌──────────────┐  ┌────────────────┐  │   │
│  │  │ auth_service.py │  │ task_service │  │ supabase_      │  │   │
│  │  │ (Supabase Auth) │  │     .py      │  │ client.py      │  │   │
│  │  └─────────────────┘  └──────────────┘  └────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                  Dependencies (Injeção)                      │   │
│  │  get_anon_client / get_user_client / get_current_user       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                  Schemas (Pydantic)                          │   │
│  │  AuthRequest / AuthResponse / TaskCreate / TaskUpdate /     │   │
│  │  TaskOut / TaskListOut / Prioridade (Enum) / Status (Enum)  │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────┬───────────────────────────┘
                                          │
                                          │  supabase-py (SDK)
                                          │  PostgREST / Auth API
                                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     CAMADA DE DADOS (Supabase)                      │
│                                                                     │
│  ┌─────────────────────┐       ┌────────────────────────────────┐   │
│  │  Supabase Auth      │       │  PostgreSQL                    │   │
│  │                     │       │                                │   │
│  │ • Cadastro          │       │  ┌──────────────────────────┐  │   │
│  │ • Login             │       │  │  Table: tasks             │  │   │
│  │ • JWT Validation    │       │  │  • id (uuid, PK)         │  │   │
│  │ • Session Mgmt      │       │  │  • user_id (uuid, FK)    │  │   │
│  │                     │       │  │  • titulo (varchar)      │  │   │
│  └─────────────────────┘       │  │  • descricao (text)      │  │   │
│                                │  │  • data_limite (date)    │  │   │
│                                │  │  • prioridade (enum)     │  │   │
│                                │  │  • status (enum)         │  │   │
│                                │  │  • criada_em (timestamptz)│  │   │
│                                │  └──────────────────────────┘  │   │
│                                │                                │   │
│                                │  RLS Policies:                 │   │
│                                │  auth.uid() = user_id          │   │
│                                └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tipos Compartilhados (Shared Domain Types)

Os tipos de domínio são definidos em **ambas as camadas** e devem permanecer sincronizados:

| Conceito       | Frontend (`constants.js`)         | Backend (`schemas.py`)               | Valores Válidos                          |
| -------------- | --------------------------------- | ------------------------------------ | ---------------------------------------- |
| **Prioridade** | `PRIORIDADES` array               | `Prioridade(str, Enum)`              | `baixa`, `media`, `alta`                 |
| **Status**     | `STATUS` array                    | `Status(str, Enum)`                  | `pendente`, `em_andamento`, `concluida`  |
| **Tarefa**     | Objeto JS (useTasks / mock)       | `TaskOut(BaseModel)`                 | `{ id, user_id, titulo, descricao, data_limite, prioridade, status, criada_em }` |
| **Requisição Auth** | —                            | `AuthRequest(BaseModel)`            | `{ email: EmailStr, password: str }`     |
| **Resposta Auth**   | —                            | `AuthResponse(BaseModel)`           | `{ access_token: str, user: UserOut }`   |

### Contrato de Comunicação (API)

Todas as requisições usam **JSON** e autenticação **Bearer JWT**:

```
┌──────────────┐                          ┌──────────────┐
│   Frontend   │   Authorization: Bearer  │   Backend    │
│   (React)    │ ───────────────────────► │   (FastAPI)  │
│              │   Content-Type: JSON     │              │
│              │ ◄─────────────────────── │              │
└──────────────┘   { data ou error }      └──────────────┘
```

**Formato da Tarefa no JSON:**

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "titulo": "string",
  "descricao": "string",
  "data_limite": "2025-12-31",
  "prioridade": "baixa | media | alta",
  "status": "pendente | em_andamento | concluida",
  "criada_em": "2025-01-15T10:30:00Z"
}
```

---
### Tipo de sistema distribuído

O TaskFlow pode ser classificado principalmente como um sistema distribuído de informação. Sua função principal é armazenar, consultar e atualizar dados. Ele não depende de processamento distribuído pesado nem de sensores ou dispositivos físicos.

## Transparência

### Observabilidade e Logging

| Camada        | Mecanismo                                                                 |
| ------------- | ------------------------------------------------------------------------- |
| **Frontend**  | `ToastContext` exibe feedback visual (sucesso/erro) ao usuário           |
| **Backend**   | FastAPI gera logs automáticos de todas as requisições (status, duração)   |
| **Banco**     | Supabase oferece dashboard com logs de acesso e queries executadas        |
| **Erros API** | Padronizados como `{ detail: "mensagem" }` — frontend exibe via Toast     |

### Fluxo de Dados Transparente

```
Usuário interage na UI
    │
    ▼
useTasks hook (estado + operações)
    │
    ▼
Services layer (auth.js / tasks.js)
    │
    ▼
http.js (monta request, adiciona token, trata erros)
    │
    ▼
FastAPI Routers (validação Pydantic + autenticação)
    │
    ▼
Services (auth_service / task_service)
    │
    ▼
Supabase Client (SDK) → PostgreSQL (RLS garante isolamento)
    │
    ▼
Resposta percorre a mesma rota de volta
    │
    ▼
Toast feedback ao usuário
```

### Acesso do Usuário aos Dados

O **RLS (Row Level Security)** no banco garante transparência no isolamento:
- Cada usuário só enxerga suas próprias tarefas (`auth.uid() = user_id`)
- Não é possível acessar tarefas de outros usuários, mesmo com requisição manual
- O token JWT é validado no Supabase antes de qualquer operação

---

## Escalabilidade

### Estratégias de Escalabilidade

```
                    ┌──────────────────────────────────────┐
                    │           CAMADAS ESCALÁVEIS          │
                    └──────────────────────────────────────┘

  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
  │    FRONTEND     │   │     BACKEND     │   │     BANCO       │
  │                 │   │                 │   │                 │
  │ • CDN (static)  │   │ • Horizontal    │   │ • PostgreSQL    │
  │ • Code splitting│   │   (múltiplos    │   │   gerenciado    │
  │ • Lazy loading  │   │   workers)      │   │ • RLS para      │
  │ • Componentes   │   │ • Stateless     │   │   multi-tenant   │
  │   reutilizáveis │   │   (sem sessão   │   │ • Índices       │
  │ • Cache local   │   │   no servidor)  │   │                 │
  │   (localStorage)│   │ • Cache HTTP    │   │                 │
  └─────────────────┘   └─────────────────┘   └─────────────────┘
```

| Nível              | Como o TaskFlow suporta                                                   |
| ------------------ | ------------------------------------------------------------------------- |
| **Frontend**       | Componentes reutilizáveis (`ui/`), services abstraídos, mock toggleável  |
| **Backend**        | FastAPI é async/await, API stateless (JWT), separação routers/services   |
| **Banco**          | Supabase escala automaticamente, RLS elimina necessidade de lógica extra |
| **Novas features** | Adicionar nova rota = novo arquivo em `routers/` + schema em `schemas.py`|
| **Multi-tenant**   | RLS por `user_id` — naturalmente suporta múltiplos usuários             |

---

## Cenários de Falha (Fault Tolerance)

### Matriz de Falhas

```
┌─────────────────────────────────────────────────────────────────────┐
│                    O QUE ACONTECE SE...                             │
├────────────────────────┬────────────────────────────────────────────┤
│  COMPONENTE FALHA      │  COMPORTAMENTO DO SISTEMA                 │
├────────────────────────┼────────────────────────────────────────────┤
│                        │                                            │
│  Supabase (Banco)      │  Backend retorna 500/503                   │
│  fica indisponível     │  Frontend exibe Toast de erro              │
│                        │  Usuário vê mensagem amigável              │
│                        │  Dados não são corrompidos (transação)     │
│                        │                                            │
├────────────────────────┼────────────────────────────────────────────┤
│                        │                                            │
│  Backend (FastAPI)     │  Frontend recebe erro de rede              │
│  cai ou reinicia       │  http.js trata erro e exibe Toast          │
│                        │  Usuário pode tentar novamente             │
│                        │  Não há perda de dados (stateless)         │
│                        │                                            │
├────────────────────────┼────────────────────────────────────────────┤
│                        │                                            │
│  Frontend (React)      │  Página para de responder                  │
│  quebra (JS error)     │  React Error Boundary captura erro         │
│                        │  Usuário pode recarregar página            │
│                        │  Dados no Supabase permanecem intactos     │
│                        │                                            │
├────────────────────────┼────────────────────────────────────────────┤
│                        │                                            │
│  Autenticação          │  Token expirado → backend retorna 401      │
│  falha (token inválido)│  Frontend redireciona para /login          │
│                        │  Usuário faz login novamente               │
│                        │                                            │
├────────────────────────┼────────────────────────────────────────────┤
│                        │                                            │
│  Modo mock (frontend)  │  Dados ficam no localStorage               │
│  sem backend           │  Interface funciona 100% offline           │
│                        │  Perda de dados ao limpar cache            │
│                        │                                            │
├────────────────────────┼────────────────────────────────────────────┤
│                        │                                            │
│  Request HTTP          │  http.js adiciona timeout                  │
│  demora muito          │  Toast informa "timeout" ao usuário        │
│                        │  Usuário pode retry manualmente            │
│                        │                                            │
├────────────────────────┼────────────────────────────────────────────┤
│                        │                                            │
│  Banco retorna dados   │  FastAPI valida com Pydantic               │
│  inconsistentes        │  Resposta 500 com mensagem de erro         │
│                        │  Frontend exibe Toast                      │
│                        │                                            │
└────────────────────────┴────────────────────────────────────────────┘
```

### Fluxo de Tratamento de Erros

```
Erro acontece em qualquer camada
         │
         ▼
┌─────────────────────┐
│  Camada detecta erro │
│  (try/catch ou HTTP) │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐     ┌──────────────────────┐
│  Erro é propagado    │────►│  ToastContext exibe   │
│  via HTTP response   │     │  mensagem ao usuário  │
│  { detail: "..." }  │     └──────────────────────┘
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Sistema continua    │
│  funcional           │
│  (nenhum dado é      │
│   perdido)           │
└─────────────────────┘
```

### Princípios de Tolerância a Falhas

1. **Isolamento**: Falha em uma camada não afeta dados em outras camadas
2. **Feedback**: O usuário sempre recebe uma mensagem clara sobre o que aconteceu
3. **Retry**: Operações podem ser repetidas sem risco de duplicação
4. **Fallback**: Modo mock permite uso offline quando o backend está indisponível
5. **Validação**: Pydantic no backend e validators no frontend garantem integridade

---


## 9. Como executar

### Backend

Na pasta `server`, instale as dependências e configure as variáveis do Supabase:

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

Na pasta `client`, configure a URL da API e execute:

```bash
npm install
npm run dev
```

Com o modo mock ativado, o frontend pode ser executado sem configurar o backend. Para usar o Supabase, é necessário criar o banco a partir do arquivo `schema.sql` e preencher as variáveis de ambiente indicadas na documentação.

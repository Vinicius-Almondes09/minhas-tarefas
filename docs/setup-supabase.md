# Guia de Configuração — Supabase (TaskFlow)

Passo a passo para deixar o projeto funcionando com o Supabase como banco de
dados e autenticação. Ao final, o fluxo completo estará no ar:

```
React (client/)  →  FastAPI (server/)  →  Supabase (Postgres + Auth)
```

**Pré-requisitos**

- Conta gratuita em [supabase.com](https://supabase.com) (pode entrar com GitHub)
- Repositório do projeto com as pastas `client/` e `server/` já criadas

---

## Passo 1 — Criar o projeto no Supabase

1. No painel (dashboard), clique em **"Comece seu projeto"** (New project);
2. Se quiser, clique em **"Continuar com o GitHub"** para conectar a conta
   (opcional — dá para pular);
3. Preencha o formulário:
   - **Nome:** `Projetos Faculdade` (ou `taskflow`);
   - **Tipo:** Pessoal;
   - **Plano:** Grátis – $0/mês;
4. **Senha do banco de dados:** clique em **"Gerar uma senha"** e guarde a senha
   em um lugar seguro (vamos precisar dela se for acessar o Postgres
   diretamente). Não compartilhe com ninguém;
5. **Região:** pode deixar "Américas" (escolha a mais próxima se preferir);
6. **Opções de segurança** (importantes para o nosso trabalho):
   - ✅ **Habilitar API de Dados** — ativado;
   - ❌ **Expor automaticamente novas tabelas** — **desmarque** (controlamos o
     acesso manualmente pelas policies de RLS);
   - ✅ **Ativar RLS automático** — ativado (essencial: garante que cada usuário
     veja apenas as próprias tarefas);
7. **Organização:** deixe `Projetos Faculdade` (ou a que você criou);
8. **GitHub (opcional):** não precisa conectar agora;
9. Clique em **"Create new project"** e aguarde o provisionamento (leva
   cerca de 1–2 minutos).

---

## Passo 2 — Desativar a confirmação de e-mail (recomendado)

Por padrão, o Supabase exige que o usuário **confirme o e-mail** depois do
cadastro antes de poder fazer login. Para o fluxo do trabalho (cadastrar e já
entrar), desative:

1. Menu lateral → **Authentication → Providers**;
2. Na seção **Email**, desligue o interruptor **"Confirm email"**;
3. Salve.

> **O que acontece se ficar ligado?** O cadastro cria a conta, mas o backend
> responde com a mensagem *"Conta criada! Confirme seu e-mail antes de entrar"*
> e não retorna o token. Para produção, o recomendado é **manter ligado** e
> fazer o fluxo de confirmação de verdade.

---

## Passo 3 — Obter as credenciais da API

1. Menu lateral → **Project Settings → API**;
2. Copie dois valores:
   - **Project URL** → vai em `SUPABASE_URL`;
   - **anon / public key** → vai em `SUPABASE_ANON_KEY`.

> A chave `anon/public` **pode** ficar exposta no frontend — ela é protegida
> pelo RLS. A chave `service_role` **nunca** deve ir para o frontend; neste
> projeto nem precisamos dela.

---

## Passo 4 — C1'riar a tabela `tasks` com RLS

1. Menu lateral → **SQL Editor → New query**;
2. Cole o conteúdo do arquivo [`server/schema.sql`](../server/schema.sql);
3. Clique em **Run**;
4. Confira em **Table Editor → tasks** que a tabela foi criada.

### O que o script faz

**1. Cria a tabela** — cada tarefa pertence a um usuário (`user_id` aponta para
`auth.users` e é apagada junto com a conta):

```sql
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null,
  descricao text not null default '',
  data_limite date not null,
  prioridade text not null default 'media'
    check (prioridade in ('baixa', 'media', 'alta')),
  status text not null default 'pendente'
    check (status in ('pendente', 'em_andamento', 'concluida')),
  criada_em timestamptz not null default now()
);
```

**2. Cria um índice** para acelerar as consultas por usuário.

**3. Ativa o RLS e cria as 4 policies** — a regra de ouro do trabalho
("cada usuário vê apenas as próprias tarefas"):

```sql
alter table public.tasks enable row level security;

create policy "Usuários podem ver as próprias tarefas"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Usuários podem criar as próprias tarefas"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar as próprias tarefas"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Usuários podem excluir as próprias tarefas"
  on public.tasks for delete
  using (auth.uid() = user_id);
```

`auth.uid()` é o id do usuário autenticado (extraído do JWT). Se o `user_id`
da linha não bater com o usuário logado, a operação é bloqueada pelo banco —
mesmo que alguém tente forçar o id de outro usuário na requisição.

---

## Passo 5 — Configurar o backend (FastAPI)

1. Crie o `.env` do servidor a partir do exemplo:

   ```bash
   cd server
   cp .env.example .env
   ```

2. Edite o `.env` com as credenciais do **Passo 3**:

   ```env
   SUPABASE_URL=https://SEU-PROJETO.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Instale as dependências e suba a API:

   ```bash
   python -m venv venv
   source venv/bin/activate        # Windows: venv\Scripts\activate
   pip install -r sever/requirements.txt
   uvicorn main:app --reload
   ```

4. Teste rápido: abra `http://localhost:8000/docs` (Swagger) e execute um
   `POST /auth/register` com um e-mail/senha para confirmar que o Supabase
   está respondendo.

---

## Passo 6 — Conectar o frontend

1. No `client/.env`, desligue o modo demonstração e aponte para o backend:

   ```env
   VITE_API_URL=http://localhost:8000
   VITE_USE_MOCK=false
   ```

2. Suba o frontend:

   ```bash
   cd client
   npm install
   npm run dev
   ```

3. Fluxo completo de teste: **cadastrar** → **criar uma tarefa** →
   **atualizar o status** → **sair** → **entrar de novo** e confirmar que as
   tarefas continuam lá (persistidas no Supabase).

---

## Passo 7 — Rodar os testes do backend

```bash
cd server
source venv/bin/activate      # se ainda não estiver ativo
pytest -v
```

Os **23 testes** não dependem do Supabase real: usam uma implementação
fictícia do cliente (`server/tests/fakes.py`) que emula a autenticação e o
RLS em memória.

---

## Passo 8 (opcional) — Conferir o RLS funcionando

No SQL Editor, rode esta consulta simulando um usuário autenticado:

```sql
-- simula um usuário logado
set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-000000000001"}';

select * from public.tasks;   -- deve retornar 0 linhas (RLS bloqueando)
```

E confirme que uma inserção com `user_id` de outro usuário é negada:

```sql
set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-000000000001"}';

insert into public.tasks (user_id, titulo, data_limite)
values ('00000000-0000-0000-0000-000000000002', 'Invadindo', '2026-12-31');
-- deve falhar: new row violates row-level security policy
```

---

## Solução de problemas

| Sintoma                                                             | Causa provável                                        | Solução                                        |
| ------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------- |
| Frontend: "Não foi possível conectar ao servidor"                   | Backend parado ou `VITE_API_URL` errada               | Suba o uvicorn e confira o `client/.env`       |
| API: "Credenciais do Supabase não configuradas"                     | `server/.env` ausente ou vazio                        | Faça o **Passo 5**                             |
| Cadastro: "Conta criada! Confirme seu e-mail antes de entrar"       | "Confirm email" ativado                               | Faça o **Passo 2**                             |
| Login: "E-mail ou senha incorretos"                                 | E-mail não confirmado ou senha errada                 | Confirme o e-mail / redefina a senha           |
| Tarefas: "Tabela não encontrada" (500 no backend)                   | `schema.sql` não executado                            | Faça o **Passo 4**                             |
| RLS bloqueando operações legítimas                                  | `user_id` não preenchido ou policy ausente            | Rode o `schema.sql` completo                   |
| Erro `service_role`/`anon` incorreta                                | Chave trocada nas variáveis                           | Compare com o **Passo 3**                      |

---

## Resumo das variáveis

| Onde            | Variável            | Valor                          | Obtida em                |
| --------------- | ------------------- | ------------------------------ | ------------------------ |
| `server/.env`   | `SUPABASE_URL`      | `https://xxxx.supabase.co`     | Project Settings → API   |
| `server/.env`   | `SUPABASE_ANON_KEY` | `eyJ...` (anon/public)         | Project Settings → API   |
| `client/.env`   | `VITE_API_URL`      | `http://localhost:8000`        | — (endereço do backend)  |
| `client/.env`   | `VITE_USE_MOCK`     | `false`                        | —                        |

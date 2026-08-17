-- ============================================================
-- TASKFLOW — Schema do Supabase
-- Execute este script no SQL Editor do projeto Supabase.
-- ============================================================

-- Tabela de tarefas
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

-- Índice para consultas por usuário
create index if not exists tasks_user_id_idx on public.tasks (user_id);

-- ------------------------------------------------------------
-- Row Level Security (RLS)
-- Cada usuário só enxerga/alterar as próprias tarefas.
-- ------------------------------------------------------------
alter table public.tasks enable row level security;

drop policy if exists "Usuários podem ver as próprias tarefas" on public.tasks;
create policy "Usuários podem ver as próprias tarefas"
  on public.tasks for select
  using (auth.uid() = user_id);

drop policy if exists "Usuários podem criar as próprias tarefas" on public.tasks;
create policy "Usuários podem criar as próprias tarefas"
  on public.tasks for insert
  with check (auth.uid() = user_id);

drop policy if exists "Usuários podem atualizar as próprias tarefas" on public.tasks;
create policy "Usuários podem atualizar as próprias tarefas"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Usuários podem excluir as próprias tarefas" on public.tasks;
create policy "Usuários podem excluir as próprias tarefas"
  on public.tasks for delete
  using (auth.uid() = user_id);

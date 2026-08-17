"""Serviço de tarefas — CRUD via Supabase (PostgREST).

Todas as consultas são restritas ao `user_id` do usuário autenticado
(defesa em profundidade). Além disso, o cliente usa o JWT do usuário,
então o RLS do Supabase também garante o isolamento entre contas.
"""

from typing import Optional

from fastapi import HTTPException
from postgrest.exceptions import APIError
from supabase import Client


def _executar(operacao) -> dict:
    """Executa uma operação do PostgREST traduzindo erros de API."""
    try:
        return operacao.execute()
    except APIError as exc:
        mensagem = getattr(exc, "message", None) or str(exc)
        raise HTTPException(
            status_code=500, detail=f"Erro ao acessar o banco de dados: {mensagem}"
        ) from exc


def list_tasks(client: Client, user_id: str) -> list:
    response = _executar(
        client.table("tasks")
        .select("*")
        .eq("user_id", user_id)
        .order("criada_em", desc=True)
    )
    return response.data


def create_task(client: Client, user_id: str, task: dict) -> dict:
    payload = {**task, "user_id": user_id}
    response = _executar(client.table("tasks").insert(payload))
    if not response.data:
        raise HTTPException(status_code=400, detail="Não foi possível criar a tarefa.")
    return response.data[0]


def update_task(client: Client, user_id: str, task_id: str, changes: dict) -> dict:
    response = _executar(
        client.table("tasks")
        .update(changes)
        .eq("id", task_id)
        .eq("user_id", user_id)
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
    return response.data[0]


def delete_task(client: Client, user_id: str, task_id: str) -> dict:
    response = _executar(
        client.table("tasks")
        .delete()
        .eq("id", task_id)
        .eq("user_id", user_id)
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
    return {"mensagem": "Tarefa excluída com sucesso."}

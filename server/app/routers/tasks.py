"""Rotas de tarefas (CRUD) — exigem autenticação."""

from fastapi import APIRouter, Depends, status
from supabase import Client

from ..dependencies import get_current_user, get_user_client
from ..schemas import TaskCreate, TaskListOut, TaskOut, TaskUpdate
from ..services import task_service

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=TaskListOut)
def list_tasks(
    user: dict = Depends(get_current_user),
    client: Client = Depends(get_user_client),
) -> dict:
    return {"tasks": task_service.list_tasks(client, user["id"])}


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    user: dict = Depends(get_current_user),
    client: Client = Depends(get_user_client),
) -> dict:
    return task_service.create_task(client, user["id"], payload.model_dump())


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: str,
    payload: TaskUpdate,
    user: dict = Depends(get_current_user),
    client: Client = Depends(get_user_client),
) -> dict:
    changes = payload.model_dump(exclude_unset=True)
    return task_service.update_task(client, user["id"], task_id, changes)


@router.delete("/{task_id}")
def delete_task(
    task_id: str,
    user: dict = Depends(get_current_user),
    client: Client = Depends(get_user_client),
) -> dict:
    return task_service.delete_task(client, user["id"], task_id)

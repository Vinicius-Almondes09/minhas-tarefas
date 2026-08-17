"""Modelos Pydantic usados nas rotas (contrato com o frontend)."""

from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, EmailStr, Field


class Prioridade(str, Enum):
    baixa = "baixa"
    media = "media"
    alta = "alta"


class Status(str, Enum):
    pendente = "pendente"
    em_andamento = "em_andamento"
    concluida = "concluida"


# ------------------------------------------------------------------
# Autenticação
# ------------------------------------------------------------------

class AuthRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)


class UserOut(BaseModel):
    id: str
    email: EmailStr


class AuthResponse(BaseModel):
    access_token: str
    user: UserOut


# ------------------------------------------------------------------
# Tarefas
# ------------------------------------------------------------------

class TaskCreate(BaseModel):
    titulo: str = Field(min_length=1, max_length=120)
    descricao: str = Field(default="", max_length=500)
    data_limite: date
    prioridade: Prioridade
    status: Status


class TaskUpdate(BaseModel):
    titulo: str | None = Field(default=None, min_length=1, max_length=120)
    descricao: str | None = Field(default=None, max_length=500)
    data_limite: date | None = None
    prioridade: Prioridade | None = None
    status: Status | None = None


class TaskOut(BaseModel):
    id: str
    user_id: str
    titulo: str
    descricao: str
    data_limite: date
    prioridade: str
    status: str
    criada_em: datetime | None = None


class TaskListOut(BaseModel):
    tasks: list[TaskOut]

"""Dependências reutilizadas pelas rotas."""

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client

from .services.auth_service import fetch_user
from .services.supabase_client import create_supabase_client

bearer_scheme = HTTPBearer(auto_error=False)


def get_anon_client() -> Client:
    """Cliente do Supabase sem token (role anônima) — usado nas rotas de auth."""
    return create_supabase_client()


def get_user_client(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> Client:
    """Cliente do Supabase autenticado com o JWT do usuário (RLS ativo)."""
    if credentials is None:
        raise HTTPException(status_code=401, detail="Não autenticado.")
    return create_supabase_client(token=credentials.credentials)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    client: Client = Depends(get_anon_client),
) -> dict:
    """Valida o JWT no Supabase e retorna { id, email } do usuário logado."""
    token = credentials.credentials if credentials else None
    return fetch_user(client, token)

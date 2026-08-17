"""Rotas de autenticação (contrato com o frontend)."""

from fastapi import APIRouter, Depends, status
from supabase import Client

from ..dependencies import get_anon_client, get_current_user
from ..schemas import AuthRequest, AuthResponse, UserOut
from ..services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: AuthRequest, client: Client = Depends(get_anon_client)) -> dict:
    return auth_service.register_user(client, payload.email, payload.password)


@router.post("/login", response_model=AuthResponse)
def login(payload: AuthRequest, client: Client = Depends(get_anon_client)) -> dict:
    return auth_service.login_user(client, payload.email, payload.password)


@router.get("/me", response_model=UserOut)
def me(user: dict = Depends(get_current_user)) -> dict:
    return user

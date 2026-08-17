"""Serviço de autenticação — delega ao Supabase Auth (GoTrue).

O Supabase é responsável por validar e-mail/senha e emitir os JWTs.
Este módulo traduz os erros do GoTrue em respostas HTTP amigáveis.
"""

from fastapi import HTTPException
from supabase import Client

# O pacote de erros do auth foi renomeado: gotrue -> supabase_auth.
try:  # supabase >= 2.30 (pacote supabase-auth)
    from supabase_auth.errors import AuthApiError
except ImportError:  # supabase < 2.30 (pacote gotrue)
    from gotrue.errors import AuthApiError  # type: ignore


def _mensagem_erro(exc: AuthApiError) -> str:
    return getattr(exc, "message", None) or str(exc)


def _resposta_auth(response) -> dict:
    """Converte a resposta do Supabase no contrato { access_token, user }."""
    return {
        "access_token": response.session.access_token,
        "user": {"id": response.user.id, "email": response.user.email},
    }


def register_user(client: Client, email: str, password: str) -> dict:
    try:
        response = client.auth.sign_up({"email": email, "password": password})
    except AuthApiError as exc:
        mensagem = _mensagem_erro(exc).lower()
        if "already" in mensagem or "registered" in mensagem:
            raise HTTPException(
                status_code=409, detail="Já existe uma conta com este e-mail."
            ) from exc
        raise HTTPException(status_code=400, detail=_mensagem_erro(exc)) from exc

    # Sem sessão na resposta = confirmação de e-mail habilitada no painel.
    if not response.session or not response.session.access_token:
        raise HTTPException(
            status_code=400,
            detail=(
                "Conta criada! Confirme seu e-mail antes de entrar. "
                "Para testes, desative a confirmação de e-mail no painel do Supabase "
                "(Authentication -> Providers -> Email)."
            ),
        )

    return _resposta_auth(response)


def login_user(client: Client, email: str, password: str) -> dict:
    try:
        response = client.auth.sign_in_with_password({"email": email, "password": password})
    except AuthApiError as exc:
        mensagem = _mensagem_erro(exc).lower()
        if "invalid login credentials" in mensagem:
            raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.") from exc
        if "not confirmed" in mensagem:
            raise HTTPException(
                status_code=400,
                detail="Confirme seu e-mail antes de entrar (verifique sua caixa de entrada).",
            ) from exc
        raise HTTPException(
            status_code=401, detail="Não foi possível autenticar. Tente novamente."
        ) from exc

    return _resposta_auth(response)


def fetch_user(client: Client, token: str | None) -> dict:
    """Valida o JWT no Supabase e retorna { id, email }."""
    if not token:
        raise HTTPException(status_code=401, detail="Não autenticado.")

    try:
        response = client.auth.get_user(token)
    except AuthApiError as exc:
        raise HTTPException(
            status_code=401,
            detail="Sessão inválida ou expirada. Faça login novamente.",
        ) from exc

    return {"id": response.user.id, "email": response.user.email}

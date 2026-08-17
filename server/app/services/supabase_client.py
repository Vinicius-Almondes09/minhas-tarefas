"""Criação do cliente do Supabase.

Com um token de usuário, as consultas são feitas como aquele usuário e o
RLS (Row Level Security) é aplicado pelo PostgREST. Sem token, a role
usada é a anônima (usada apenas para as rotas de autenticação).
"""

from typing import Optional

from supabase import Client, ClientOptions, create_client

from ..config import SUPABASE_ANON_KEY, SUPABASE_URL, require_supabase_config


def create_supabase_client(token: Optional[str] = None) -> Client:
    require_supabase_config()

    options = None
    if token:
        # ClientOptions (formato do supabase-py) — o formato {"global": {...}}
        # é do supabase-js e quebra a criação do cliente no Python.
        options = ClientOptions(headers={"Authorization": f"Bearer {token}"})

    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY, options=options)

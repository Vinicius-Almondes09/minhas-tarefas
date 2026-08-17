"""Configurações do backend, lidas do arquivo .env (ou variáveis de ambiente)."""

import os

from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "").strip()


def require_supabase_config() -> None:
    """Garante que as credenciais do Supabase estejam configuradas."""
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise RuntimeError(
            "Credenciais do Supabase não configuradas. "
            "Crie o arquivo server/.env a partir de .env.example "
            "com SUPABASE_URL e SUPABASE_ANON_KEY."
        )

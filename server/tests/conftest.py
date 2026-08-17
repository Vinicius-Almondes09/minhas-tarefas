import os
import sys

# Garante que o diretório server/ esteja no path (rodando de server/ ou da raiz).
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.testclient import TestClient

from app.dependencies import bearer_scheme, get_anon_client, get_user_client
from main import app

from tests.fakes import FakeDB, FakeSupabase


@pytest.fixture
def db() -> FakeDB:
    return FakeDB()


@pytest.fixture
def client(db: FakeDB):
    """TestClient com o Supabase real substituído pelo fake (via dependency overrides)."""

    def override_anon_client() -> FakeSupabase:
        return FakeSupabase(db)

    def override_user_client(
        credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    ) -> FakeSupabase:
        token = credentials.credentials if credentials else None
        return FakeSupabase(db, token=token)

    app.dependency_overrides[get_anon_client] = override_anon_client
    app.dependency_overrides[get_user_client] = override_user_client

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()

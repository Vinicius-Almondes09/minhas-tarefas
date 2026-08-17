"""Funções auxiliares compartilhadas pelos testes."""


def register_and_login(client, email: str, password: str) -> dict:
    """Cadastra e retorna { access_token, user }."""
    response = client.post("/auth/register", json={"email": email, "password": password})
    assert response.status_code == 201, response.text
    return response.json()


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def criar_tarefa_payload(**overrides) -> dict:
    payload = {
        "titulo": "Estudar FastAPI",
        "descricao": "Revisar routers, schemas e testes",
        "data_limite": "2026-12-31",
        "prioridade": "alta",
        "status": "pendente",
    }
    payload.update(overrides)
    return payload

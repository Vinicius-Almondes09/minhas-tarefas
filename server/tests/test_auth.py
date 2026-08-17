"""Testes de autenticação/autorização.

Validam: cadastro, login, sessão (/auth/me) e rejeição de requisições
sem token ou com token inválido.
"""

from tests.helpers import auth_headers, register_and_login


def test_register_retorna_token_e_usuario(client):
    response = client.post(
        "/auth/register", json={"email": "ana@exemplo.com", "password": "123456"}
    )

    assert response.status_code == 201
    data = response.json()
    assert data["access_token"]
    assert data["user"]["email"] == "ana@exemplo.com"
    assert data["user"]["id"]


def test_register_com_email_duplicado_retorna_409(client):
    payload = {"email": "ana@exemplo.com", "password": "123456"}
    client.post("/auth/register", json=payload)

    response = client.post("/auth/register", json=payload)

    assert response.status_code == 409
    assert "já existe" in response.json()["detail"].lower()


def test_register_com_senha_curta_retorna_422(client):
    response = client.post(
        "/auth/register", json={"email": "ana@exemplo.com", "password": "123"}
    )

    assert response.status_code == 422


def test_register_com_email_invalido_retorna_422(client):
    response = client.post(
        "/auth/register", json={"email": "email-invalido", "password": "123456"}
    )

    assert response.status_code == 422


def test_login_retorna_token_e_usuario(client):
    register_and_login(client, "ana@exemplo.com", "123456")

    response = client.post(
        "/auth/login", json={"email": "ana@exemplo.com", "password": "123456"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["access_token"]
    assert data["user"]["email"] == "ana@exemplo.com"


def test_login_com_senha_errada_retorna_401(client):
    register_and_login(client, "ana@exemplo.com", "123456")

    response = client.post(
        "/auth/login", json={"email": "ana@exemplo.com", "password": "senha-errada"}
    )

    assert response.status_code == 401
    assert "incorretos" in response.json()["detail"].lower()


def test_login_de_usuario_inexistente_retorna_401(client):
    response = client.post(
        "/auth/login", json={"email": "nao-existe@exemplo.com", "password": "123456"}
    )

    assert response.status_code == 401


def test_me_retorna_usuario_autenticado(client):
    token = register_and_login(client, "ana@exemplo.com", "123456")["access_token"]

    response = client.get("/auth/me", headers=auth_headers(token))

    assert response.status_code == 200
    assert response.json()["email"] == "ana@exemplo.com"


def test_me_sem_token_retorna_401(client):
    response = client.get("/auth/me")

    assert response.status_code == 401


def test_me_com_token_invalido_retorna_401(client):
    response = client.get("/auth/me", headers=auth_headers("token-invalido"))

    assert response.status_code == 401

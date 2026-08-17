"""Testes do CRUD de tarefas.

Validam: criação (POST), listagem (GET), atualização (PATCH), exclusão
(DELETE), validação de payload e o isolamento entre usuários (ninguém
acessa/alterar/exclui tarefas de outra conta).
"""

from tests.helpers import auth_headers, criar_tarefa_payload, register_and_login


def _token(client, email: str = "ana@exemplo.com") -> str:
    return register_and_login(client, email, "123456")["access_token"]


# ------------------------------------------------------------------
# Criação (POST /tasks)
# ------------------------------------------------------------------

def test_criar_tarefa(client):
    token = _token(client)

    response = client.post("/tasks", json=criar_tarefa_payload(), headers=auth_headers(token))

    assert response.status_code == 201
    data = response.json()
    assert data["titulo"] == "Estudar FastAPI"
    assert data["prioridade"] == "alta"
    assert data["status"] == "pendente"
    assert data["data_limite"] == "2026-12-31"
    assert data["user_id"]


def test_criar_tarefa_sem_titulo_retorna_422(client):
    token = _token(client)
    payload = criar_tarefa_payload()
    payload.pop("titulo")

    response = client.post("/tasks", json=payload, headers=auth_headers(token))

    assert response.status_code == 422


def test_criar_tarefa_com_prioridade_invalida_retorna_422(client):
    token = _token(client)
    payload = criar_tarefa_payload(prioridade="urgentissima")

    response = client.post("/tasks", json=payload, headers=auth_headers(token))

    assert response.status_code == 422


# ------------------------------------------------------------------
# Listagem (GET /tasks)
# ------------------------------------------------------------------

def test_listar_tarefas(client):
    token = _token(client)
    client.post("/tasks", json=criar_tarefa_payload(), headers=auth_headers(token))
    client.post(
        "/tasks", json=criar_tarefa_payload(titulo="Segunda tarefa"), headers=auth_headers(token)
    )

    response = client.get("/tasks", headers=auth_headers(token))

    assert response.status_code == 200
    assert len(response.json()["tasks"]) == 2


def test_listar_tarefas_sem_tarefas_retorna_lista_vazia(client):
    token = _token(client)

    response = client.get("/tasks", headers=auth_headers(token))

    assert response.status_code == 200
    assert response.json()["tasks"] == []


# ------------------------------------------------------------------
# Atualização (PATCH /tasks/:id)
# ------------------------------------------------------------------

def test_atualizar_tarefa(client):
    token = _token(client)
    criada = client.post("/tasks", json=criar_tarefa_payload(), headers=auth_headers(token)).json()

    response = client.patch(
        f"/tasks/{criada['id']}",
        json={"status": "concluida", "prioridade": "baixa"},
        headers=auth_headers(token),
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "concluida"
    assert data["prioridade"] == "baixa"
    assert data["titulo"] == criada["titulo"]  # campos não enviados não mudam


def test_atualizar_tarefa_inexistente_retorna_404(client):
    token = _token(client)

    response = client.patch(
        "/tasks/nao-existe",
        json={"status": "concluida"},
        headers=auth_headers(token),
    )

    assert response.status_code == 404


# ------------------------------------------------------------------
# Exclusão (DELETE /tasks/:id)
# ------------------------------------------------------------------

def test_excluir_tarefa(client):
    token = _token(client)
    criada = client.post("/tasks", json=criar_tarefa_payload(), headers=auth_headers(token)).json()

    response = client.delete(f"/tasks/{criada['id']}", headers=auth_headers(token))

    assert response.status_code == 200
    assert "exclu" in response.json()["mensagem"].lower()

    restantes = client.get("/tasks", headers=auth_headers(token)).json()["tasks"]
    assert all(tarefa["id"] != criada["id"] for tarefa in restantes)


def test_excluir_tarefa_inexistente_retorna_404(client):
    token = _token(client)

    response = client.delete("/tasks/nao-existe", headers=auth_headers(token))

    assert response.status_code == 404


# ------------------------------------------------------------------
# Autorização / isolamento entre usuários
# ------------------------------------------------------------------

def test_rotas_de_tarefas_requerem_autenticacao(client):
    assert client.get("/tasks").status_code == 401
    assert client.post("/tasks", json=criar_tarefa_payload()).status_code == 401
    assert client.patch("/tasks/qualquer", json={"status": "concluida"}).status_code == 401
    assert client.delete("/tasks/qualquer").status_code == 401


def test_usuario_nao_ve_tarefas_de_outro_usuario(client):
    token_ana = _token(client, "ana@exemplo.com")
    token_bia = _token(client, "bia@exemplo.com")
    client.post("/tasks", json=criar_tarefa_payload(), headers=auth_headers(token_ana))

    response = client.get("/tasks", headers=auth_headers(token_bia))

    assert response.status_code == 200
    assert response.json()["tasks"] == []


def test_usuario_nao_atualiza_tarefa_de_outro_usuario(client):
    token_ana = _token(client, "ana@exemplo.com")
    token_bia = _token(client, "bia@exemplo.com")
    criada = client.post("/tasks", json=criar_tarefa_payload(), headers=auth_headers(token_ana)).json()

    response = client.patch(
        f"/tasks/{criada['id']}",
        json={"status": "concluida"},
        headers=auth_headers(token_bia),
    )

    assert response.status_code == 404


def test_usuario_nao_exclui_tarefa_de_outro_usuario(client):
    token_ana = _token(client, "ana@exemplo.com")
    token_bia = _token(client, "bia@exemplo.com")
    criada = client.post("/tasks", json=criar_tarefa_payload(), headers=auth_headers(token_ana)).json()

    response = client.delete(f"/tasks/{criada['id']}", headers=auth_headers(token_bia))

    assert response.status_code == 404

    # A tarefa de Ana continua existindo
    restantes = client.get("/tasks", headers=auth_headers(token_ana)).json()["tasks"]
    assert any(tarefa["id"] == criada["id"] for tarefa in restantes)

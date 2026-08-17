"""Implementação fictícia do cliente Supabase usada nos testes.

Emula o suficiente da API do supabase-py para exercitar as rotas sem
depender de uma conta real:
  - auth.sign_up / sign_in_with_password / get_user
  - table("tasks").select/insert/update/delete/eq/order/execute

O RLS é emulado: consultas só enxergam linhas cujo `user_id` corresponde
ao usuário do token usado para criar o cliente.
"""

import uuid

try:  # supabase >= 2.30 (pacote supabase-auth)
    from supabase_auth.errors import AuthApiError
    _AUTH_ERROR_CODE = None
except ImportError:  # supabase < 2.30 (pacote gotrue)
    from gotrue.errors import AuthApiError  # type: ignore


class FakeAuthError(AuthApiError):
    """Erro compatível com AuthApiError do Supabase (para o mapeamento nas rotas)."""

    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message, status_code, _AUTH_ERROR_CODE)


class FakeSession:
    def __init__(self, access_token: str, refresh_token: str = "refresh-token"):
        self.access_token = access_token
        self.refresh_token = refresh_token


class FakeUser:
    """Emula o objeto User retornado pelo supabase-py (atributos .id e .email)."""

    def __init__(self, id: str, email: str):
        self.id = id
        self.email = email


class FakeAuthResponse:
    def __init__(self, user: dict | FakeUser, session: FakeSession | None = None):
        if isinstance(user, dict):
            user = FakeUser(user["id"], user["email"])
        self.user = user
        self.session = session


class FakeResponse:
    def __init__(self, data):
        self.data = data


class FakeDB:
    """Banco em memória compartilhado entre os clientes fake."""

    def __init__(self):
        self.users_by_email: dict[str, dict] = {}
        self.tasks: dict[str, dict] = {}

    def add_user(self, email: str, password: str) -> dict:
        user = {"id": str(uuid.uuid4()), "email": email}
        self.users_by_email[email] = {**user, "password": password}
        return user


class FakeAuth:
    def __init__(self, db: FakeDB):
        self.db = db

    def sign_up(self, credentials: dict) -> FakeAuthResponse:
        email = credentials["email"]
        password = credentials["password"]

        if email in self.db.users_by_email:
            raise FakeAuthError("User already registered", status_code=409)

        user = self.db.add_user(email, password)
        session = FakeSession(access_token=f"fake-token-{user['id']}")
        return FakeAuthResponse(user, session)

    def sign_in_with_password(self, credentials: dict) -> FakeAuthResponse:
        registro = self.db.users_by_email.get(credentials["email"])
        if not registro or registro["password"] != credentials["password"]:
            raise FakeAuthError("Invalid login credentials", status_code=401)

        user = {"id": registro["id"], "email": registro["email"]}
        return FakeAuthResponse(user, FakeSession(access_token=f"fake-token-{user['id']}"))

    def get_user(self, jwt: str | None = None) -> FakeAuthResponse:
        if not jwt or not jwt.startswith("fake-token-"):
            raise FakeAuthError("Invalid JWT", status_code=401)

        user_id = jwt.removeprefix("fake-token-")
        registro = next(
            (u for u in self.db.users_by_email.values() if u["id"] == user_id), None
        )
        if not registro:
            raise FakeAuthError("Invalid JWT", status_code=401)

        return FakeAuthResponse({"id": registro["id"], "email": registro["email"]})


class FakeTable:
    """Emula table('tasks') do supabase-py com filtros e RLS."""

    def __init__(self, db: FakeDB, token: str | None):
        self.db = db
        self.token = token
        self._filters: list[tuple[str, object]] = []
        self._insert_data: dict | None = None
        self._update_data: dict | None = None
        self._delete = False

    # --- construtores de consulta (retornam self) ---
    def select(self, *cols):
        return self

    def eq(self, col: str, value):
        self._filters.append((col, value))
        return self

    def order(self, col: str, desc: bool = False):
        return self

    def insert(self, data):
        self._insert_data = data
        return self

    def update(self, data):
        self._update_data = data
        return self

    def delete(self):
        self._delete = True
        return self

    # --- RLS emulado ---
    def _current_uid(self) -> str | None:
        if not self.token or not self.token.startswith("fake-token-"):
            return None
        return self.token.removeprefix("fake-token-")

    def _visible_rows(self) -> list[dict]:
        uid = self._current_uid()
        return [
            row
            for row in self.db.tasks.values()
            if uid is None or row["user_id"] == uid
        ]

    def _matches(self, row: dict) -> bool:
        return all(row.get(col) == value for col, value in self._filters)

    def execute(self) -> FakeResponse:
        if self._insert_data is not None:
            row = dict(self._insert_data)
            row.setdefault("id", str(uuid.uuid4()))
            row.setdefault("criada_em", "2026-01-01T00:00:00")
            self.db.tasks[row["id"]] = row
            return FakeResponse([row])

        visiveis = [row for row in self._visible_rows() if self._matches(row)]

        if self._update_data is not None:
            atualizadas = []
            for row in visiveis:
                nova = {**row, **self._update_data}
                self.db.tasks[row["id"]] = nova
                atualizadas.append(nova)
            return FakeResponse(atualizadas)

        if self._delete:
            removidas = [self.db.tasks.pop(row["id"]) for row in visiveis]
            return FakeResponse(removidas)

        return FakeResponse(visiveis)


class FakeSupabase:
    """Cliente fake: `auth` + `table('tasks')`."""

    def __init__(self, db: FakeDB, token: str | None = None):
        self.db = db
        self.token = token
        self.auth = FakeAuth(db)

    def table(self, name: str) -> FakeTable:
        assert name == "tasks", f"Tabela não suportada no fake: {name}"
        return FakeTable(self.db, self.token)

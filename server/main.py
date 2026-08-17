from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers import auth, tasks

app = FastAPI(
    title="Minhas Tarefas API",
    description="API do sistema de gerenciamento de tarefas (TaskFlow)",
    version="1.0",
)

# Permite o frontend (Vite em http://localhost:5173) acessar a API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)


@app.exception_handler(RuntimeError)
async def runtime_error_handler(request: Request, exc: RuntimeError):
    """Devolve mensagens claras (ex.: Supabase não configurado) como JSON."""
    return JSONResponse(status_code=500, content={"detail": str(exc)})


@app.get("/")
def inicio():
    return {"mensagem": "Sistema Minhas Tarefas funcionando!"}

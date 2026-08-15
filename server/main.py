from fastapi import FastAPI

app = FastAPI(
    title="Minhas Tarefas API",
    description="API do sistema de gerenciamento de tarefas",
    version="1.0"
)

@app.get("/")
def inicio():
    return {
        "mensagem": "Sistema Minhas Tarefas funcionando!"
    }
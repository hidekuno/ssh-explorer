#
# uv run uvicorn main:app --port=8000
# uv run uvicorn main:app --port=8000 --reload
#

from fastapi import FastAPI, Request
from routers import ssh
from routers import sftp
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from core.exceptions import ServerCommandError

app = FastAPI(title="this is demo program")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ssh.router)
app.include_router(sftp.router)


@app.exception_handler(ServerCommandError)
def server_command_exception_handler(request: Request, exc: ServerCommandError):
    return JSONResponse(
        status_code=500,
        content={"message": str(exc)},
    )


@app.get("/")
def hello():
    return "Hello,World"

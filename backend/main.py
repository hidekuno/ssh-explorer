from fastapi import FastAPI, Request
from routers import ssh
from routers import sftp
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from core.exceptions import ServerCommandError
import logging


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SSH Explorer Backend")

# SECURITY: Restrict origins in production
# Example: allow_origins=["https://your-frontend.com"]
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
    logger.error(f"ServerCommandError: {exc.err_msg}")
    return JSONResponse(
        status_code=500,
        content={"message": "A remote command error occurred."},
    )


@app.get("/")
def hello():
    return {"message": "SSH Explorer API is running"}

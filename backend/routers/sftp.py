from fastapi import APIRouter
from core.ssh import core_proc
from services.sftp import sftp_list_directory
from schemas.ssh import SshRequest
from schemas.ssh import ExplorerResponse


router = APIRouter(
    prefix="/sftp",
    tags=["sftp"]
)

@router.post("/list_dir/sftp")
def list_dir_sftp(data: SshRequest, responses_model=ExplorerResponse):
    return core_proc(data, sftp_list_directory)

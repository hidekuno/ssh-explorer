from fastapi import APIRouter
from core.ssh import core_proc
from services.ssh import ssh_list_directory_datetime
from services.ssh import ssh_list_directory
from schemas.ssh import SshRequest
from schemas.ssh import ExplorerResponse

router = APIRouter(
    prefix="/ssh",
    tags=["ssh"]
)


@router.post("/list_dir/datetime")
def list_dir_ssh_datetime(data: SshRequest):
    return core_proc(data, ssh_list_directory_datetime)


@router.post("/list_dir/ssh")
def list_dir_ssh(data: SshRequest, responses_model=ExplorerResponse):
    return core_proc(data, ssh_list_directory)

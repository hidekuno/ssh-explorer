import paramiko
import io
import traceback
from fastapi.responses import JSONResponse
from schemas.ssh import SshRequest
from core.exceptions import ServerCommandError


SSH_TIMEOUT = 5

def connect_ssh(ssh_client, data: SshRequest):
    ssh_client.set_missing_host_key_policy(paramiko.WarningPolicy())

    try:
        with open(data.ssh_private_key) as fd:
            pk = paramiko.RSAKey.from_private_key(io.StringIO(fd.read()))
            ssh_client.connect(
                data.host,
                port=int(data.port),
                username=data.user,
                pkey=pk,
                timeout=SSH_TIMEOUT,
            )
    except FileNotFoundError:
        ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        ssh_client.connect(
            data.host,
            port=int(data.port),
            username=data.user,
            timeout=SSH_TIMEOUT,
        )
    return None


def core_proc(data: SshRequest, proc):
    ssh_client = paramiko.SSHClient()

    try:
        connect_ssh(ssh_client, data)
        return proc(data, ssh_client)

    except ServerCommandError as e:
        return JSONResponse(status_code=400, content={"error": e.err_msg})

    except paramiko.SSHException as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": f"SSH Error: {str(e)}"})

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": f"Error: {str(e)}"})

    finally:
        ssh_client.close()

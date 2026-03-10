import paramiko
import io
import os
import traceback
import logging
from fastapi.responses import JSONResponse
from schemas.ssh import SshRequest
from core.exceptions import ServerCommandError


SSH_TIMEOUT = 5
SAFE_KEY_DIR = "keys"

logger = logging.getLogger(__name__)

def connect_ssh(ssh_client, data: SshRequest):
    # Host key validation policy (In production, RejectPolicy is recommended with known_hosts)
    ssh_client.set_missing_host_key_policy(paramiko.WarningPolicy())

    key_path = os.path.join(SAFE_KEY_DIR, data.ssh_private_key_name)

    if not os.path.exists(key_path):
         # If no key found, fall back to password or system-default keys (if allowed by business logic)
         # In a strict environment, we should raise an error here.
         ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
         ssh_client.connect(
            data.host,
            port=data.port,
            username=data.user,
            timeout=SSH_TIMEOUT,
        )
         return

    try:
        with open(key_path, "r") as fd:
            pk = paramiko.RSAKey.from_private_key(io.StringIO(fd.read()))
            ssh_client.connect(
                data.host,
                port=data.port,
                username=data.user,
                pkey=pk,
                timeout=SSH_TIMEOUT,
            )
    except Exception as e:
        logger.error(f"SSH Connection Failed: {str(e)}")
        raise e

def core_proc(data: SshRequest, proc):
    ssh_client = paramiko.SSHClient()

    try:
        connect_ssh(ssh_client, data)
        return proc(data, ssh_client)

    except ServerCommandError as e:
        logger.error(f"Command Error: {e.err_msg}")
        # Sanitize message for the user
        return JSONResponse(status_code=400, content={"error": "Remote command execution failed."})

    except paramiko.SSHException as e:
        logger.error(f"SSH Exception: {str(e)}")
        return JSONResponse(status_code=500, content={"error": "SSH communication error."})

    except Exception as e:
        logger.error(f"General Error: {str(e)}")
        return JSONResponse(status_code=500, content={"error": "Internal server error."})

    finally:
        ssh_client.close()

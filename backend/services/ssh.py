import shlex
import re
from os.path import basename
from core.exceptions import ServerCommandError
from schemas.ssh import SshRequest
from schemas.ssh import ExplorerResponse
from utils.cmd import get_ls_cmd


def execute_command(ssh_client, command):
    stdin, stdout, stderr = ssh_client.exec_command(command)
    data = stdout.read().decode().split("\n")[:-1]

    ret = stdout.channel.recv_exit_status()
    if ret != 0:
        err = stderr.read().decode().split("\n")
        raise ServerCommandError(err[0] if err else "Unknown error")

    return data


def ssh_list_directory(data: SshRequest, ssh_client):
    def format_list(l):
        return [basename(f) for f in sorted([f for f in l])]

    quoted_path = shlex.quote(data.path)

    # Use -- to mark the end of options for find and cd
    cdir = execute_command(ssh_client, f"cd -- {quoted_path} && /bin/pwd")
    # -maxdepth must come before the path in some versions of find,
    # but in most modern ones it should follow the path.
    # For maximum compatibility: find [path] [options]
    dirs = execute_command(
        ssh_client, f"/usr/bin/find -- {quoted_path} -maxdepth 1 -type d"
    )
    files = execute_command(
        ssh_client, f"/usr/bin/find -- {quoted_path} -maxdepth 1 -type f"
    )

    dirs = format_list(dirs[1:])
    files = format_list(files)
    if data.up:
        dirs = [".."] + dirs

    return ExplorerResponse(current_dir=cdir[0], dirs=dirs, files=files)


def ssh_list_directory_datetime(data: SshRequest, ssh_client):
    def make_find_cmd(dir_path, lscmd, ftype):
        # Ensure -print0 is used correctly with xargs
        return f"/usr/bin/find -- {dir_path} -maxdepth 1 -type {ftype} -print0 {lscmd}"

    def format_list(l):
        def make_ret_value(line):
            rec = re.split(r"\s+", line)
            # Match the regex used in the original code, but handle carefully
            f = re.sub(r"^.*\d\d\d\d/\d\d/\d\d \d\d:\d\d ", "", line)
            # Handle possible empty record issues
            meta = f"{rec[4]:12} {rec[5]} {rec[6]}" if len(rec) >= 7 else ""
            return [basename(f), meta]
        return [make_ret_value(line) for line in sorted(l, key=lambda x: x[0])]

    quoted_path = shlex.quote(data.path)

    uname = execute_command(ssh_client, "uname")[0]
    lscmd = get_ls_cmd(uname)

    cdir = execute_command(ssh_client, f"cd -- {quoted_path} && /bin/pwd")

    # Executing find with time meta information
    dirs_output = execute_command(ssh_client, make_find_cmd(quoted_path, lscmd, "d"))
    files_output = execute_command(ssh_client, make_find_cmd(quoted_path, lscmd, "f"))

    dirs = format_list(dirs_output[1:])
    dirs = [d for d in dirs if d[0] != "."]
    files = format_list(files_output)
    files = [f for f in files if f[0] != "."]

    if data.up:
        dirs = [["..", ""]] + dirs

    return {"current_dir": cdir[0], "dirs": dirs, "files": files}

import stat
from schemas.ssh import ExplorerResponse
from schemas.ssh import SshRequest


def sftp_list_directory(data: SshRequest, ssh_client):
    sftp_con = ssh_client.open_sftp()
    sftp_con.chdir(data.path)
    files = sftp_con.listdir_attr(".")

    return ExplorerResponse(
        current_dir=sftp_con.getcwd(),
        dirs=[f.filename for f in files if stat.S_ISDIR(f.st_mode)],
        files=[f.filename for f in files if stat.S_ISREG(f.st_mode)],
    )

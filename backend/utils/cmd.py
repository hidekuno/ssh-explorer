def get_ls_cmd(os):
    linux_cmd = "| xargs -0 ls -ld --time-style=+'%Y/%m/%d %H:%M'"
    freebsd_cmd = "| xargs -0 ls -ld -D '%Y/%m/%d %H:%M'"

    if os == "Linux":
        return linux_cmd
    elif os == "FreeBSD":
        return freebsd_cmd
    elif os == "Darwin":
        return freebsd_cmd
    else:
        return freebsd_cmd

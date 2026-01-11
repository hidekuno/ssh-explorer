class ServerCommandError(Exception):
    def __init__(self, err_msg):
        self.err_msg = err_msg
        super().__init__(err_msg)

    def __str__(self):
        return "ServerCommandError"

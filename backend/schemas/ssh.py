import re
from pydantic import BaseModel, Field, field_validator
from typing import List


class SshRequest(BaseModel):
    path: str = Field(..., description="The directory path")
    host: str = Field(..., description="The SSH server host")
    user: str = Field(..., description="The SSH user")
    port: int = Field(22, ge=1, le=65535, description="The SSH port")
    ssh_private_key_name: str = Field(..., description="The name of the SSH private key file in the keys/ directory")
    up: bool = Field(False, description="Whether to include the parent directory")

    @field_validator("host")
    def validate_host(cls, v):
        if not re.match(r"^[a-zA-Z0-9\.-]+$", v):
            raise ValueError("Invalid host format. Only alphanumeric characters, dots, and hyphens are allowed.")
        return v

    @field_validator("user")
    def validate_user(cls, v):
        if not re.match(r"^[a-z_][a-z0-9_-]*$", v):
            raise ValueError("Invalid username format.")
        return v

    @field_validator("path")
    def validate_path(cls, v):
        # Prevent shell expansion, pipes, and other dangerous characters
        if re.search(r"[\$`|;\n\r]", v):
            raise ValueError("Path contains illegal characters ($ ` | ; \n \r are prohibited).")
        # Basic path traversal prevention (could be more sophisticated depending on requirements)
        if ".." in v:
             # If "up" is allowed, you might need a different strategy, but for direct paths we block it.
             # Note: ".." is often handled by the logic itself, but here we block it as a raw input for safety.
             raise ValueError("Path traversal is not allowed.")
        return v

    @field_validator("ssh_private_key_name")
    def validate_key_name(cls, v):
        if not re.match(r"^[a-zA-Z0-9_-]+\.?(pem|key|pub)?$", v):
            raise ValueError("Invalid private key name format.")
        return v


class ExplorerResponse(BaseModel):
    current_dir: str
    dirs: List[str] = []
    files: List[str] = []

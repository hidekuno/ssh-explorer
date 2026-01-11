from pydantic import BaseModel, Field, field_validator
from typing import List


class SshRequest(BaseModel):
    path: str = Field(..., description="The directory path")
    host: str = Field(..., description="The SSH server host")
    user: str = Field(..., description="The SSH user")
    port: str = Field(..., description="The SSH port")
    ssh_private_key: str = Field(..., description="The SSH private key")
    up: bool = Field(False, description="Whether to include the parent directory")

    @field_validator("port")
    def validate_port(cls, value):
        if not value.isdigit():
            raise ValueError("Port must be a numeric value.")
        return value

    @field_validator("path")
    def validate_path(cls, value):
        if ";" in value:
            raise ValueError("Path contains illegal characters.")
        return value


class ExplorerResponse(BaseModel):
    current_dir: str
    dirs: List[str] = []
    files: List[str] = []

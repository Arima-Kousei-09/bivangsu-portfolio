
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, Field

from app.security import limiter


router = APIRouter(
    prefix="/api/terminal",
    tags=["Terminal"],
)


class TerminalRequest(BaseModel):
    command: str = Field(
        min_length=1,
        max_length=120,
        strip_whitespace=True,
    )


class TerminalResponse(BaseModel):
    command: str
    output: str


COMMANDS = {
    "whoami": (
        "Bivangsu Sinha\n"
        "ECE Student | Developer | Debater | Curious Human\n"
        "Location: Kolkata, India"
    ),
    "about": (
        "A personal archive of projects, ideas, experiments, "
        "and things worth learning."
    ),
    "interests": (
        "Electronics and Embedded Systems\n"
        "Mathematics and Physics\n"
        "Software Development\n"
        "Philosophy and Literature\n"
        "Competitive Debating"
    ),
    "projects": (
        "NightOwlTab - Debate tabulation software\n"
        "Environmental Monitoring - ESP32 project\n"
        "Spin to Win - Godot game jam project\n"
        "Linux Experiments - Arch and Gentoo"
    ),
    "date": lambda: datetime.now(timezone.utc).strftime(
        "%Y-%m-%d %H:%M:%S UTC"
    ),
}


@router.post("/execute", response_model=TerminalResponse)
@limiter.limit("30/minute")
async def execute_command(
    request: Request,
    response: Response,
    payload: TerminalRequest,
):
    command = payload.command.lower()

    if command not in COMMANDS:
        raise HTTPException(
            status_code=400,
            detail="Unknown command. Type 'help' for available commands.",
        )

    result = COMMANDS[command]
    output = result() if callable(result) else result

    return TerminalResponse(
        command=command,
        output=output,
    )

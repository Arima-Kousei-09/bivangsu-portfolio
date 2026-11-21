
"use strict";

// Backend configuration
const API_BASE_URL = "http://127.0.0.1:8000";
const TERMINAL_API_URL = `${API_BASE_URL}/api/terminal/execute`;

const MAX_COMMAND_LENGTH = 120;
const MAX_HISTORY_LENGTH = 50;

const BACKEND_COMMANDS = new Set([
  "whoami",
  "about",
  "interests",
  "projects",
  "date",
]);

// DOM references
const terminalOverlay = document.getElementById("terminal-overlay");
const openTerminalButton = document.getElementById("open-terminal");
const closeTerminalButton = document.getElementById("close-terminal");
const terminalForm = document.getElementById("terminal-form");
const terminalInput = document.getElementById("terminal-input");
const terminalOutput = document.getElementById("terminal-output");
const terminalContent = document.getElementById("terminal-content");

// State
const commandHistory = [];
let historyIndex = 0;
let previousFocus = null;
let previousBodyOverflow = "";
let focusTimer = null;
let commandInProgress = false;

// Safe DOM helpers
function printOutput(content) {
  if (!terminalOutput) return;

  const response = document.createElement("div");
  response.className = "command-response";
  response.textContent = String(content);
  terminalOutput.appendChild(response);
}

function printCommand(command) {
  if (!terminalOutput) return;

  const entry = document.createElement("div");
  entry.className = "command-entry";

  const line = document.createElement("div");
  line.className = "command-line";

  const prompt = document.createElement("span");
  prompt.className = "prompt";
  prompt.textContent = "arima@archive:~$";

  const commandText = document.createElement("span");
  commandText.textContent = command;

  line.append(prompt, commandText);
  entry.appendChild(line);
  terminalOutput.appendChild(entry);
}

function scrollTerminalToBottom() {
  if (terminalContent) {
    terminalContent.scrollTop = terminalContent.scrollHeight;
  }
}

function clearTerminal() {
  terminalOutput?.replaceChildren();
}

// Open and close terminal
function openTerminal() {
  if (!terminalOverlay || terminalOverlay.classList.contains("is-open")) {
    return;
  }

  previousFocus = document.activeElement;
  previousBodyOverflow = document.body.style.overflow;

  terminalOverlay.classList.add("is-open");
  terminalOverlay.setAttribute("aria-hidden", "false");
  terminalOverlay.inert = false;

  openTerminalButton?.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";

  if (focusTimer !== null) clearTimeout(focusTimer);

  focusTimer = setTimeout(() => {
    focusTimer = null;

    if (terminalOverlay.classList.contains("is-open")) {
      terminalInput?.focus();
    }
  }, 100);
}

function closeTerminal() {
  if (!terminalOverlay || !terminalOverlay.classList.contains("is-open")) {
    return;
  }

  if (focusTimer !== null) {
    clearTimeout(focusTimer);
    focusTimer = null;
  }

  terminalOverlay.classList.remove("is-open");
  terminalOverlay.setAttribute("aria-hidden", "true");
  terminalOverlay.inert = true;

  openTerminalButton?.setAttribute("aria-expanded", "false");
  document.body.style.overflow = previousBodyOverflow;

  if (previousFocus?.isConnected) previousFocus.focus();
  previousFocus = null;
}

openTerminalButton?.addEventListener("click", openTerminal);
closeTerminalButton?.addEventListener("click", closeTerminal);

// Keyboard accessibility
document.addEventListener("keydown", (event) => {
  if (!terminalOverlay?.classList.contains("is-open")) return;

  if (event.key === "Escape") {
    event.preventDefault();
    closeTerminal();
    return;
  }

  if (event.key === "Tab") {
    const elements = terminalOverlay.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    );

    const focusable = Array.from(elements).filter(
      (element) =>
        !element.hidden &&
        element.getAttribute("aria-hidden") !== "true"
    );

    if (!focusable.length) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

// Local commands
const localCommands = Object.freeze({
  help: () => `
AVAILABLE COMMANDS

  help                 Display available commands
  whoami               Introduce yourself
  about                Learn about Arima
  interests            Explore areas of interest
  projects             List current projects
  project <name>       Explore a specific project
  debate               Competitive debating profile
  achievements         Awards and credentials
  contact              Contact information
  date                 Display current date
  clear                Clear terminal output
  exit                 Return to the portfolio

TIP: Commands are case-insensitive.
`,

  debate: () => `
COMPETITIVE DEBATING

FORMATS:
  British Parliamentary (BP)
  Asian Parliamentary (AP)

EXPERIENCE:
  Competitive debating
  Tournament moderation
  Society leadership
  Training and community-building

Use: achievements
`,

  achievements: () => `
DEBATING RECORD

  ZEASTY PRO AM
  Broke into Open Speaker Finals (OSF).

  VOXPOP '26
  Semifinalist.

  SAMASWARA '26
  Moderator: Preliminary rounds and Finals.
  Vice-President.

  DEBATING FORUM
  Winner: Best Speaker.
  Winner: Best Team.
`,

  contact: () => `
CONTACT

Email: [EMAIL ADDRESS TO BE ADDED]
GitHub: [GITHUB PROFILE TO BE ADDED]
LinkedIn: [LINKEDIN PROFILE TO BE ADDED]

Contact details will be updated soon.
`,
});

// Project database
const projects = Object.freeze({
  nightowltab: `
PROJECT: NIGHTOWLTAB

An open-source tournament management and tabulation
platform designed to make competitive debating
infrastructure more accessible.

Initial format: British Parliamentary.

STACK:
  Python
  Git
  Modular Monolith Architecture

STATUS: IN DEVELOPMENT
`,

  environmental: `
PROJECT: ENVIRONMENTAL MONITORING

An ESP32-based environmental monitoring experiment
integrating multiple sensors.

SENSORS:
  Temperature
  pH
  Turbidity
  Total Dissolved Solids (TDS)

PLATFORM: ESP32
`,

  spin: `
PROJECT: SPIN TO WIN

A slot-machine-inspired game developed for a game jam.

FEATURES:
  Three reels
  Credit management
  Probability-based outcomes

ENGINE: GODOT
LANGUAGE: GDSCRIPT
`,

  linux: `
PROJECT: LINUX EXPLORATION

Experiments with Linux distributions, system
configuration, package management, and desktop
environment customisation.

DISTRIBUTIONS:
  Arch Linux
  Gentoo
`,
});

// Input validation
function validateCommand(rawCommand) {
  if (typeof rawCommand !== "string") {
    return { valid: false, message: "Invalid command input." };
  }

  const command = rawCommand.trim();

  if (!command) {
    return { valid: false, message: "Empty command." };
  }

  if (command.length > MAX_COMMAND_LENGTH) {
    return {
      valid: false,
      message: `Command exceeds ${MAX_COMMAND_LENGTH} characters.`,
    };
  }

  if (/[\u0000-\u001F\u007F]/.test(command)) {
    return {
      valid: false,
      message: "Command contains unsupported characters.",
    };
  }

  return { valid: true, command };
}

// Backend communication
async function executeBackendCommand(command) {
  let response;

  try {
    response = await fetch(TERMINAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ command }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    if (error.name === "TimeoutError") {
      printOutput("The backend took too long to respond. Try again.");
    } else {
      printOutput(
        "Could not connect to the portfolio API. Make sure the FastAPI server is running."
      );
    }
    return;
  }

  let data;

  try {
    data = await response.json();
  } catch {
    printOutput("The API returned an invalid response.");
    return;
  }

  if (!response.ok) {
    if (response.status === 429) {
      printOutput("Rate limit exceeded. Please wait before trying again.");
    } else if (response.status === 400) {
      printOutput(
        data.detail || "The API did not recognise that command."
      );
    } else {
      printOutput(
        data.detail || `API request failed with status ${response.status}.`
      );
    }
    return;
  }

  if (typeof data.output !== "string") {
    printOutput("The API response did not contain valid terminal output.");
    return;
  }

  printOutput(data.output);
}

// Command execution
async function executeCommand(rawCommand) {
  const validation = validateCommand(rawCommand);

  if (!validation.valid) {
    printOutput(validation.message);
    return;
  }

  const command = validation.command;
  printCommand(command);

  const parts = command.split(/\s+/);
  const baseCommand = parts[0].toLowerCase();
  const argument = parts.slice(1).join(" ").toLowerCase();

  if (baseCommand === "clear") {
    clearTerminal();
    return;
  }

  if (baseCommand === "exit") {
    closeTerminal();
    return;
  }

  if (baseCommand === "project") {
    if (!argument) {
      printOutput("Usage: project <name>");
      return;
    }

    if (Object.hasOwn(projects, argument)) {
      printOutput(projects[argument]);
    } else {
      printOutput(
        "Project not found. Type 'projects' to see available projects."
      );
    }

    scrollTerminalToBottom();
    return;
  }

  if (Object.hasOwn(localCommands, baseCommand)) {
    if (parts.length > 1) {
      printOutput(`The '${baseCommand}' command does not accept arguments.`);
      return;
    }

    printOutput(localCommands[baseCommand]());
    scrollTerminalToBottom();
    return;
  }

  if (BACKEND_COMMANDS.has(baseCommand)) {
    if (parts.length > 1) {
      printOutput(`The '${baseCommand}' command does not accept arguments.`);
      return;
    }

    await executeBackendCommand(baseCommand);
    scrollTerminalToBottom();
    return;
  }

  printOutput(
    `Command not found: ${baseCommand}\n` +
      "Type 'help' to see available commands."
  );

  scrollTerminalToBottom();
}

// Form submission
terminalForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!terminalInput || commandInProgress) return;

  const command = terminalInput.value.trim();
  if (!command) return;

  const validation = validateCommand(command);

  if (!validation.valid) {
    printOutput(validation.message);
    terminalInput.value = "";
    return;
  }

  if (commandHistory.length >= MAX_HISTORY_LENGTH) {
    commandHistory.shift();
  }

  commandHistory.push(validation.command);
  historyIndex = commandHistory.length;

  terminalInput.value = "";
  commandInProgress = true;
  terminalInput.disabled = true;

  try {
    await executeCommand(validation.command);
  } finally {
    commandInProgress = false;
    terminalInput.disabled = false;

    if (terminalOverlay?.classList.contains("is-open")) {
      terminalInput.focus();
    }

    scrollTerminalToBottom();
  }
});

// Command history
terminalInput?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") {
    event.preventDefault();

    if (historyIndex > 0) {
      historyIndex--;
      terminalInput.value = commandHistory[historyIndex];
    }
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();

    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      terminalInput.value = commandHistory[historyIndex];
    } else {
      historyIndex = commandHistory.length;
      terminalInput.value = "";
    }
  }
});

// Initialisation
console.info(
  "%c ARIMA TERMINAL INITIALISED ",
  "background: #c6a87c; color: #101010; padding: 5px;"
);

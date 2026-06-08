#!/usr/bin/env bash
#
# Frontier Agentic AI Platform — local dev launcher.
# Double-click in Finder, or run `./start.command` from a terminal.
#
# Starts the Next.js app on a FIXED port (3000). If that port is already
# in use, the existing process is stopped first so there is never a
# port conflict and the URL stays stable at http://localhost:3000.

set -euo pipefail

# ── Config ──────────────────────────────────────────────────────────
PORT=3000

# Resolve the directory this script lives in, then the app/ subfolder.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$SCRIPT_DIR/app"

cd "$APP_DIR"

# ── Ensure node/npm are on PATH ─────────────────────────────────────
# A double-clicked .command launches with the system default PATH,
# which omits Homebrew (/opt/homebrew/bin on Apple Silicon,
# /usr/local/bin on Intel). brew shellenv is only sourced by an
# interactive login shell — not by Finder — so load it here when npm
# is missing, making this launcher work however it is started.
if ! command -v npm >/dev/null 2>&1; then
  for brew_bin in /opt/homebrew/bin/brew /usr/local/bin/brew; do
    if [ -x "$brew_bin" ]; then
      eval "$("$brew_bin" shellenv)"
      break
    fi
  done
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "❌  Could not find 'npm' on PATH." >&2
  echo "    Install Node.js (e.g. 'brew install node') and try again." >&2
  exit 1
fi

# ── Free the fixed port if a server is already LISTENing on it ──────
# Only target the process that holds the LISTEN socket (never clients
# such as a browser with an open connection to the port), and kill its
# whole process group — `next dev` is a supervisor that respawns its
# server child if you kill the child alone.
listener_pid="$(lsof -tiTCP:"${PORT}" -sTCP:LISTEN 2>/dev/null | head -1 || true)"
if [ -n "${listener_pid}" ]; then
  pgid="$(ps -o pgid= -p "${listener_pid}" 2>/dev/null | tr -d ' ')"
  echo "⚠️  Port ${PORT} is held by PID ${listener_pid} — stopping that server…"
  kill -TERM "-${pgid}" 2>/dev/null || kill -TERM "${listener_pid}" 2>/dev/null || true
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    lsof -tiTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1 || break
    sleep 0.5
  done
  if lsof -tiTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "    Still alive — forcing shutdown…"
    kill -KILL "-${pgid}" 2>/dev/null || kill -KILL "${listener_pid}" 2>/dev/null || true
    sleep 1
  fi
fi

# ── Install dependencies on first run ───────────────────────────────
if [ ! -d node_modules ]; then
  echo "📦  Installing dependencies (first run)…"
  npm install
fi

# ── Launch ──────────────────────────────────────────────────────────
echo "🚀  Starting Frontier Agentic AI Platform on http://localhost:${PORT}"
echo "    (Press Ctrl+C to stop.)"
exec npm run dev

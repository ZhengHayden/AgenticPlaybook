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

# ── Free the fixed port if something is already listening ───────────
existing_pid="$(lsof -ti "tcp:${PORT}" 2>/dev/null || true)"
if [ -n "${existing_pid}" ]; then
  echo "⚠️  Port ${PORT} is in use (PID ${existing_pid}) — stopping it…"
  kill "${existing_pid}" 2>/dev/null || true
  sleep 1
  existing_pid="$(lsof -ti "tcp:${PORT}" 2>/dev/null || true)"
  if [ -n "${existing_pid}" ]; then
    echo "    Still alive — forcing shutdown…"
    kill -9 "${existing_pid}" 2>/dev/null || true
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

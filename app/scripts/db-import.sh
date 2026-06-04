#!/usr/bin/env bash
#
# Import a Playbook database bundle produced by db-export.sh on another machine.
#
# Replaces this machine's data/playbook.db with the bundled copy and restores
# uploads. Any existing DB is backed up first.
#
# IMPORTANT: stop the dev server (npm run dev) before importing, so it does not
# hold the old database handle open or recreate a stale WAL.
#
# Usage:  npm run db:import -- <bundle.tar.gz | bundle-dir>
#         PLAYBOOK_DB_PATH=/custom/playbook.db npm run db:import -- bundle.tar.gz

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

BUNDLE="${1:-}"
if [[ -z "$BUNDLE" ]]; then
  echo "usage: npm run db:import -- <bundle.tar.gz | bundle-dir>" >&2
  exit 1
fi

DB_PATH="${PLAYBOOK_DB_PATH:-$APP_DIR/data/playbook.db}"
DATA_DIR="$(dirname "$DB_PATH")"

# Resolve the bundle directory (extract the tarball to a temp dir if needed).
TMP=""
cleanup() { [[ -n "$TMP" ]] && rm -rf "$TMP"; }
trap cleanup EXIT

if [[ -f "$BUNDLE" && ( "$BUNDLE" == *.tar.gz || "$BUNDLE" == *.tgz ) ]]; then
  TMP="$(mktemp -d)"
  tar -xzf "$BUNDLE" -C "$TMP"
  SRC_DIR="$(find "$TMP" -maxdepth 1 -type d -name 'playbook-*' | head -1)"
  [[ -z "$SRC_DIR" ]] && SRC_DIR="$TMP"
elif [[ -d "$BUNDLE" ]]; then
  SRC_DIR="$BUNDLE"
else
  echo "error: '$BUNDLE' is not a .tar.gz/.tgz file or a directory" >&2
  exit 1
fi

SRC_DB="$SRC_DIR/playbook.db"
[[ -f "$SRC_DB" ]] || { echo "error: playbook.db not found in bundle ($SRC_DIR)" >&2; exit 1; }

mkdir -p "$DATA_DIR"

# Back up an existing DB (and drop stale WAL/SHM so the import is authoritative).
if [[ -f "$DB_PATH" ]]; then
  BK="$DB_PATH.bak-$(date +%Y%m%d-%H%M%S)"
  cp "$DB_PATH" "$BK"
  echo "Backed up existing DB -> $BK"
fi
rm -f "$DB_PATH-wal" "$DB_PATH-shm"

cp "$SRC_DB" "$DB_PATH"
echo "Imported DB -> $DB_PATH"

# Restore uploads (merge into the data dir).
if [[ -d "$SRC_DIR/uploads" ]] && [[ -n "$(ls -A "$SRC_DIR/uploads" 2>/dev/null)" ]]; then
  mkdir -p "$DATA_DIR/uploads"
  cp -R "$SRC_DIR/uploads/." "$DATA_DIR/uploads/"
  echo "Restored uploads -> $DATA_DIR/uploads"
fi

# Verify via an immutable URI: read-only AND WAL-safe (no -shm/-wal needed).
PROJECTS="$(sqlite3 "file:$DB_PATH?immutable=1" 'SELECT count(*) FROM projects;')"
echo "Done. projects in DB: $PROJECTS"

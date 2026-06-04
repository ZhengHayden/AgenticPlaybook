#!/usr/bin/env bash
#
# Export the Playbook SQLite database for migration to another machine.
#
# Produces a timestamped bundle under app/exports/ containing:
#   - playbook.db    a consolidated single-file copy (WAL folded in, defragmented)
#   - playbook.sql   a portable SQL dump (inspectable, SQLite-version independent)
#   - uploads/       the SOP/file uploads directory (if any)
#   - MANIFEST.txt   counts + provenance
# ...and a .tar.gz of that bundle ready to copy to the target Mac.
#
# The live DB is read only — VACUUM INTO takes a consistent snapshot and never
# writes to the source, so it is safe to run while the dev server is up.
#
# Usage:  npm run db:export
#         PLAYBOOK_DB_PATH=/custom/playbook.db npm run db:export

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

DB_PATH="${PLAYBOOK_DB_PATH:-$APP_DIR/data/playbook.db}"
DATA_DIR="$(dirname "$DB_PATH")"
UPLOADS_DIR="$DATA_DIR/uploads"

if [[ ! -f "$DB_PATH" ]]; then
  echo "error: database not found at $DB_PATH" >&2
  echo "       set PLAYBOOK_DB_PATH or run the app once to create it." >&2
  exit 1
fi

command -v sqlite3 >/dev/null || { echo "error: sqlite3 not found on PATH" >&2; exit 1; }

STAMP="$(date +%Y%m%d-%H%M%S)"
BUNDLE_NAME="playbook-$STAMP"
OUT_DIR="$APP_DIR/exports/$BUNDLE_NAME"
mkdir -p "$OUT_DIR"

echo "Exporting from: $DB_PATH"

# 1. Consolidated single-file DB (folds the WAL in, defragments). Read-only on source.
sqlite3 "$DB_PATH" "VACUUM INTO '$OUT_DIR/playbook.db'"

# 2. Portable SQL dump from the consolidated copy.
sqlite3 "$OUT_DIR/playbook.db" .dump > "$OUT_DIR/playbook.sql"

# 3. Uploaded files (SOP PDFs, etc.).
if [[ -d "$UPLOADS_DIR" ]]; then
  cp -R "$UPLOADS_DIR" "$OUT_DIR/uploads"
else
  mkdir -p "$OUT_DIR/uploads"
fi

# 4. Manifest.
PROJECTS="$(sqlite3 -readonly "$OUT_DIR/playbook.db" 'SELECT count(*) FROM projects;')"
UPLOAD_COUNT="$(find "$OUT_DIR/uploads" -type f | wc -l | tr -d ' ')"
{
  echo "exported_at: $STAMP"
  echo "source_db:   $DB_PATH"
  echo "sqlite:      $(sqlite3 --version | awk '{print $1}')"
  echo "projects:    $PROJECTS"
  echo "uploads:     $UPLOAD_COUNT file(s)"
} > "$OUT_DIR/MANIFEST.txt"

# 5. Tarball for transfer.
TARBALL="$APP_DIR/exports/$BUNDLE_NAME.tar.gz"
tar -czf "$TARBALL" -C "$APP_DIR/exports" "$BUNDLE_NAME"

echo
cat "$OUT_DIR/MANIFEST.txt"
echo
echo "Bundle:  $OUT_DIR"
echo "Tarball: $TARBALL"
echo
echo "Next: copy the tarball to the target Mac (into its 00_Playbook/app/),"
echo "      then run:  npm run db:import -- exports/$BUNDLE_NAME.tar.gz"

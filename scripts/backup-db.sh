#!/usr/bin/env bash
# Daily SQLite backup for la-mutuelle-seniors.
# Recommended cron entry on the host:
#   5 3 * * *  /home/jyblonde/lamutuelleseniors/scripts/backup-db.sh
#
# Keeps backups for BACKUP_RETENTION_DAYS (default 30) days.

set -euo pipefail

PROJECT_DIR=/home/jyblonde/lamutuelleseniors
SRC="$PROJECT_DIR/data/lamutuelleseniors.db"
DEST_DIR="${BACKUP_DIR:-/home/jyblonde/data/backups/lamutuelleseniors}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

if [ ! -f "$SRC" ]; then
  echo "[backup-db] source not found: $SRC" >&2
  exit 1
fi

mkdir -p "$DEST_DIR"
TS=$(date -u +%Y%m%dT%H%M%SZ)
DEST="$DEST_DIR/lamutuelleseniors-$TS.db"

# Use SQLite's online backup API via the .backup command run inside the
# container so WAL is flushed safely. Falls back to plain copy if docker isn't
# available (e.g. dev machine).
if command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' | grep -q '^lamutuelleseniors$'; then
  docker exec lamutuelleseniors sh -c "sqlite3 /data/lamutuelleseniors.db '.backup /data/.backup.tmp'" 2>/dev/null \
    || cp "$SRC" "$DEST_DIR/.backup.tmp"
  if [ -f "$PROJECT_DIR/data/.backup.tmp" ]; then
    mv "$PROJECT_DIR/data/.backup.tmp" "$DEST"
  else
    cp "$SRC" "$DEST"
  fi
else
  cp "$SRC" "$DEST"
fi

# Compress (most of a SQLite DB is highly compressible)
gzip -9 "$DEST"

echo "[backup-db] wrote $DEST.gz"

# Prune old backups
find "$DEST_DIR" -type f -name 'lamutuelleseniors-*.db.gz' -mtime "+$RETENTION_DAYS" -delete
echo "[backup-db] retention applied ($RETENTION_DAYS days)"

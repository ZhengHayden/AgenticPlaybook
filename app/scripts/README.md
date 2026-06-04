# Database migration

The Playbook stores everything in a single SQLite file at `app/data/playbook.db`
(WAL mode). `app/data/` is gitignored, so the data does **not** travel with a
`git pull` — use these scripts to move it between machines.

## Export (source machine)

```bash
cd app
npm run db:export
```

Creates `app/exports/playbook-<timestamp>.tar.gz` containing:

| File          | Purpose                                                        |
| ------------- | -------------------------------------------------------------- |
| `playbook.db` | Consolidated single-file DB (WAL folded in, defragmented)      |
| `playbook.sql`| Portable SQL dump — inspectable, SQLite-version independent    |
| `uploads/`    | SOP/file uploads from `data/uploads/`                          |
| `MANIFEST.txt`| Row counts + provenance                                        |

`VACUUM INTO` reads a consistent snapshot, so it is safe to run while the dev
server is up — the live DB is never modified.

## Import (target machine)

1. Get the repo there (`git pull` from the `delivery` remote) and `npm install`.
2. Copy the tarball into `00_Playbook/app/`.
3. **Stop the dev server** if it is running.
4. Run:

```bash
cd app
npm run db:import -- exports/playbook-<timestamp>.tar.gz
```

Any existing `data/playbook.db` is backed up to `data/playbook.db.bak-<timestamp>`
before being replaced. Stale `-wal`/`-shm` files are removed so the imported file
is authoritative. Then `npm run dev` and the projects appear.

## Custom DB location

Both scripts honor `PLAYBOOK_DB_PATH` (the same env var the app uses):

```bash
PLAYBOOK_DB_PATH=/some/where/playbook.db npm run db:export
```

## Restoring from the SQL dump instead

If you ever need a fresh DB from the portable dump (e.g. across very different
SQLite versions):

```bash
sqlite3 data/playbook.db < exports/playbook-<timestamp>/playbook.sql
```

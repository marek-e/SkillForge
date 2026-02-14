# Database & Migrations

## Overview

SkillForge uses **SQLite** via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) with [Drizzle ORM](https://orm.drizzle.team/) for type-safe queries and schema management. The database is stored locally at `~/.skillforge/data.db`.

## Key Files

```
apps/runtime/
  drizzle.config.ts          # Drizzle Kit configuration
  drizzle/                   # Generated migration SQL files (committed to git)
    0000_*.sql               # Initial migration
    meta/                    # Drizzle journal & snapshots (committed to git)
  src/store/
    schema.ts                # Drizzle table definitions (source of truth)
    db.ts                    # Database initialization & connection management
    index.ts                 # Store layer (CRUD operations using Drizzle queries)
```

## Schema

Tables are defined in `apps/runtime/src/store/schema.ts` using Drizzle's SQLite column builders. This file is the single source of truth for the database structure.

## Migrations

Schema changes are tracked as versioned SQL files in `apps/runtime/drizzle/` and applied automatically on startup via Drizzle's migrator. This ensures that existing user databases are updated when columns or tables are added.

### Changing the schema

1. Edit `apps/runtime/src/store/schema.ts`
2. Generate a migration:
   ```bash
   pnpm --filter @skillforge/runtime db:generate
   ```
3. Review the generated SQL in `apps/runtime/drizzle/`
4. Commit the migration file and schema change together

### What happens on startup

`initDb(migrationsFolder)` is called by each entrypoint. It:

1. Creates the `~/.skillforge/` directory if missing
2. Opens (or creates) `data.db` with WAL journal mode
3. Runs `migrate(db, { migrationsFolder })` — Drizzle checks its `__drizzle_migrations` table, finds any unapplied migrations, and executes them in order
4. Already-applied migrations are skipped

### Why `migrationsFolder` is a parameter

The migrations folder path differs by environment because tsup bundles `@skillforge/runtime` into the Electron main process, changing where `__dirname` resolves. Each entrypoint resolves and passes the correct path:

| Entrypoint                          | Resolved path                                                   |
| ----------------------------------- | --------------------------------------------------------------- |
| Runtime dev (`tsx src/index.ts`)    | `apps/runtime/drizzle/`                                         |
| Runtime prod (`node dist/index.js`) | `apps/runtime/drizzle/`                                         |
| Electron dev (tsup watch)           | `apps/runtime/drizzle/` (via `__dirname/../../runtime/drizzle`) |
| Electron prod (packaged)            | `<Resources>/drizzle/` (via `process.resourcesPath`)            |

In the packaged Electron app, migrations are shipped as an `extraResources` entry in `apps/electron/package.json`.

## Connection Management

- **`initDb(migrationsFolder)`** — Opens the database and runs migrations. Safe to call multiple times (returns existing connection).
- **`getDb()`** — Returns the active Drizzle instance. Throws if `initDb` hasn't been called.
- **`closeDb()`** — Closes the SQLite connection. Called on process shutdown.

## Guidelines

- Always use Drizzle's query builder via the store layer (`apps/runtime/src/store/index.ts`). Avoid raw SQL.
- Never modify generated migration files after they've been applied to user databases. Create a new migration instead.
- The initial migration (`0000_*.sql`) uses `CREATE TABLE IF NOT EXISTS` for backwards compatibility with databases created before the migration system existed.

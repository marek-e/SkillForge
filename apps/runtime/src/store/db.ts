import Database from 'better-sqlite3'
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import path from 'node:path'
import fs from 'node:fs'
import * as schema from './schema'

let db: BetterSQLite3Database<typeof schema> | null = null
let sqlite: Database.Database | null = null

const DB_PATH = path.join(
  process.env.HOME ?? process.env.USERPROFILE ?? '.',
  '.skillforge',
  'data.db'
)

export function initDb(migrationsFolder: string): BetterSQLite3Database<typeof schema> {
  if (db) return db

  const dbPath = DB_PATH
  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')

  db = drizzle(sqlite, { schema })

  migrate(db, { migrationsFolder })

  console.log(`Database initialized at ${dbPath}`)
  return db
}

export function getDb(): BetterSQLite3Database<typeof schema> {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.')
  }
  return db
}

export function closeDb(): void {
  if (sqlite) {
    sqlite.close()
    sqlite = null
    db = null
    console.log('Database connection closed')
  }
}

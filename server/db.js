import pg from 'pg'
import { SCHEMA } from './schema.js'

// numbers come back as numbers (not strings), dates as ISO strings
pg.types.setTypeParser(1700, (v) => (v == null ? v : parseFloat(v))) // NUMERIC
pg.types.setTypeParser(20, (v) => (v == null ? v : Number(v))) // BIGINT (counts)
pg.types.setTypeParser(1184, (v) => (v == null ? v : new Date(v).toISOString())) // TIMESTAMPTZ

let pool
function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set')
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.PG_POOL_MAX || 3),
      idleTimeoutMillis: 10_000,
    })
  }
  return pool
}

/** Run a single query. */
export const db = { query: (text, params) => getPool().query(text, params) }

/** Run several queries as one all-or-nothing transaction. `fn` receives a client with .query(). */
export async function tx(fn) {
  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {})
    throw e
  } finally {
    client.release()
  }
}

let schemaReady
export function ensureSchema() {
  schemaReady ??= db.query(SCHEMA).catch((e) => {
    schemaReady = undefined
    throw e
  })
  return schemaReady
}

import pg from 'pg'
console.log('starting test...')
console.log('URL found:', Boolean(process.env.DATABASE_URL))
const c = new pg.Client({ connectionString: process.env.DATABASE_URL })
c.connect()
  .then(() => { console.log('DB OK'); return c.end() })
  .catch((e) => console.log('DB ERROR:', e.message))
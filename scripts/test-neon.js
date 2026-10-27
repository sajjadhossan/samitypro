const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split(/\r?\n/);
let dbUrl = '';

for (const line of lines) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.substring('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
    break;
  }
}

if (!dbUrl) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

console.log('Connecting to Neon PostgreSQL...');
const pool = new Pool({ connectionString: dbUrl });

pool.query('SELECT NOW() as current_time, version() as pg_version, current_database() as db')
  .then(res => {
    console.log('✅ NEON CONNECTED SUCCESSFULLY!');
    console.log('Database:', res.rows[0].db);
    console.log('Server Time:', res.rows[0].current_time);
    console.log('Version:', res.rows[0].pg_version);
    return pool.end();
  })
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection Failed:', err.message);
    process.exit(1);
  });

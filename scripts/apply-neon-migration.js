const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split(/\r?\n/);
let dbUrl = '';

for (const line of lines) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.substring('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
    break;
  }
}

const pool = new Pool({ connectionString: dbUrl });

async function run() {
  console.log('Checking existing tables in Neon neondb...');
  const res = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  const existingTables = res.rows.map(r => r.table_name);
  console.log('Existing tables count:', existingTables.length);
  console.log('Existing tables:', existingTables);

  const schemaFile = path.resolve(process.cwd(), 'prisma/migrations/01_init_schema.sql');
  if (fs.existsSync(schemaFile)) {
    console.log('\nRunning migration 01_init_schema.sql...');
    const sql = fs.readFileSync(schemaFile, 'utf8');
    await pool.query(sql);
    console.log('✅ Migration 01_init_schema.sql applied successfully!');
    
    const afterRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('Updated tables count:', afterRes.rows.length);
    console.log('Tables:', afterRes.rows.map(r => r.table_name));
  }

  await pool.end();
}

run().catch(err => {
  console.error('Migration error:', err.message);
  process.exit(1);
});

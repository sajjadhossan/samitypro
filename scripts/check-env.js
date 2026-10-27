const path = require('path');
const fs = require('fs');

// Load .env.local into process.env
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const k = trimmed.substring(0, idx).trim();
        const v = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
        process.env[k] = v;
      }
    }
  }
}

// Compile & run or test using ts-node or node
console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'YES (configured)' : 'NO');
console.log('AWS_ENDPOINT_URL_S3 loaded:', process.env.AWS_ENDPOINT_URL_S3 ? 'YES' : 'NO');
console.log('NEON_REALTIME_URL loaded:', process.env.NEON_REALTIME_URL ? 'YES' : 'NO');

const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split(/\r?\n/)) {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx > 0) {
      env[t.substring(0, idx).trim()] = t.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
}

const s3 = new S3Client({
  region: env.AWS_REGION || 'ap-southeast-1',
  endpoint: env.AWS_ENDPOINT_URL_S3,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY
  },
  forcePathStyle: true
});

async function testUpload() {
  console.log('Testing S3 Object Storage...');
  console.log('Endpoint:', env.AWS_ENDPOINT_URL_S3);
  
  const testKey = `test/test-${Date.now()}.txt`;
  const uploadCommand = new PutObjectCommand({
    Bucket: 'assets',
    Key: testKey,
    Body: 'SamityPro S3 Cloud Storage Connectivity Verification File',
    ContentType: 'text/plain'
  });

  const uploadRes = await s3.send(uploadCommand);
  console.log('✅ Upload successful! ETag:', uploadRes.ETag);

  const listCommand = new ListObjectsV2Command({
    Bucket: 'assets',
    Prefix: 'test/'
  });
  const listRes = await s3.send(listCommand);
  console.log('Files in assets bucket:', listRes.Contents?.map(c => c.Key));
}

testUpload().catch(err => {
  console.error('❌ S3 test error:', err.message);
  process.exit(1);
});

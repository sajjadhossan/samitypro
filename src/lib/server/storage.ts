import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  ListBucketsCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let s3ClientInstance: S3Client | null = null;

export function isStorageConfigured(): boolean {
  return !!(
    process.env.AWS_ENDPOINT_URL_S3 &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
  );
}

export function getS3Client(): S3Client {
  if (!isStorageConfigured()) {
    throw new Error('Neon Object Storage environment variables are not configured.');
  }

  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      endpoint: process.env.AWS_ENDPOINT_URL_S3,
      region: process.env.AWS_REGION || 'ap-southeast-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
      forcePathStyle: true,
    });
  }

  return s3ClientInstance;
}

export const DEFAULT_BUCKET = 'assets';

export async function uploadObject(params: {
  bucket?: string;
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
}): Promise<{ bucket: string; key: string; url?: string }> {
  const bucket = params.bucket || DEFAULT_BUCKET;
  const client = getS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType || 'application/octet-stream',
    })
  );

  return {
    bucket,
    key: params.key,
    url: `${process.env.AWS_ENDPOINT_URL_S3}/${bucket}/${params.key}`,
  };
}

export async function getPresignedDownloadUrl(params: {
  bucket?: string;
  key: string;
  expiresIn?: number;
}): Promise<string> {
  const bucket = params.bucket || DEFAULT_BUCKET;
  const client = getS3Client();

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: params.key,
  });

  return await getSignedUrl(client, command, { expiresIn: params.expiresIn || 3600 });
}

export async function listObjects(params: {
  bucket?: string;
  prefix?: string;
  maxKeys?: number;
}): Promise<Array<{ key: string; size?: number; lastModified?: Date }>> {
  const bucket = params.bucket || DEFAULT_BUCKET;
  const client = getS3Client();

  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: params.prefix,
    MaxKeys: params.maxKeys || 50,
  });

  const response = await client.send(command);
  return (
    response.Contents?.map((item) => ({
      key: item.Key || '',
      size: item.Size,
      lastModified: item.LastModified,
    })) || []
  );
}

export async function deleteObject(params: {
  bucket?: string;
  key: string;
}): Promise<boolean> {
  const bucket = params.bucket || DEFAULT_BUCKET;
  const client = getS3Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: params.key,
    })
  );

  return true;
}

export async function checkStorageHealth(): Promise<{
  connected: boolean;
  provider: string;
  endpoint?: string;
  bucket?: string;
  latencyMs?: number;
  bucketsCount?: number;
  error?: string;
}> {
  if (!isStorageConfigured()) {
    return {
      connected: false,
      provider: 'Neon Object Storage',
      error: 'AWS_ENDPOINT_URL_S3 or AWS_ACCESS_KEY_ID not configured in environment',
    };
  }

  const startTime = Date.now();
  try {
    const client = getS3Client();
    const result = await client.send(new ListBucketsCommand({}));
    const latencyMs = Date.now() - startTime;

    return {
      connected: true,
      provider: 'Neon Object Storage (S3 Compatible)',
      endpoint: process.env.AWS_ENDPOINT_URL_S3,
      bucket: DEFAULT_BUCKET,
      latencyMs,
      bucketsCount: result.Buckets?.length || 0,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      provider: 'Neon Object Storage',
      endpoint: process.env.AWS_ENDPOINT_URL_S3,
      error: msg,
    };
  }
}

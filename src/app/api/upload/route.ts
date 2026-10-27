import { NextRequest, NextResponse } from 'next/server';
import { uploadObject, isStorageConfigured, DEFAULT_BUCKET } from '@/lib/server/storage';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!isStorageConfigured()) {
      return NextResponse.json({
        success: false,
        message: 'Cloud Object Storage is not configured.',
        errorCode: 'STORAGE_NOT_CONFIGURED',
        errors: []
      }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';
    const tenantId = (formData.get('tenantId') as string) || 'common';

    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'No file uploaded',
        errorCode: 'FILE_MISSING',
        errors: [{ field: 'file', message: 'Please select a file to upload' }]
      }, { status: 400 });
    }

    // File validation: Max 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({
        success: false,
        message: 'File size exceeds maximum limit of 10MB',
        errorCode: 'FILE_TOO_LARGE',
        errors: [{ field: 'file', message: 'Maximum file size allowed is 10MB' }]
      }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop() || 'dat';
    const timestamp = Date.now();
    const randomHash = Math.random().toString(36).substring(2, 9);
    const key = `${tenantId}/${folder}/${timestamp}-${randomHash}.${ext}`;

    const uploadResult = await uploadObject({
      bucket: DEFAULT_BUCKET,
      key,
      body: buffer,
      contentType: file.type || 'application/octet-stream',
    });

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully to Cloud Storage',
      data: {
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
        key: uploadResult.key,
        bucket: uploadResult.bucket,
        url: uploadResult.url
      },
      errors: []
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('File upload error:', errorMsg);
    return NextResponse.json({
      success: false,
      message: errorMsg || 'File upload failed',
      errorCode: 'UPLOAD_FAILED',
      errors: [{ field: 'file', message: errorMsg }]
    }, { status: 500 });
  }
}

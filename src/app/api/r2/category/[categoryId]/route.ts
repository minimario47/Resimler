import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { R2File } from '@/lib/r2-storage';

// Initialize R2 client
function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params;
  const publicUrl = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!publicUrl || !bucketName) {
    return NextResponse.json(
      { error: 'R2 configuration not available' },
      { status: 500 }
    );
  }

  const client = getR2Client();
  if (!client) {
    return NextResponse.json(
      { error: 'R2 client not configured' },
      { status: 500 }
    );
  }

  try {
    // List objects in the category folder
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: `${categoryId}/`,
    });

    const response = await client.send(command);
    const baseUrl = publicUrl.replace(/\/$/, '');

    const files: R2File[] = (response.Contents || [])
      .filter((obj) => {
        // Only include image files
        const key = obj.Key || '';
        return /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(key);
      })
      .map((obj) => {
        const key = obj.Key || '';
        const fileName = key.split('/').pop() || key;
        const fileId = obj.ETag?.replace(/"/g, '') || key.replace(/[^a-zA-Z0-9]/g, '_');

        return {
          id: fileId,
          name: fileName,
          key,
          url: `${baseUrl}/${key}`,
          thumbnailUrl: `${baseUrl}/${key}`,
          size: obj.Size,
          uploadedAt: obj.LastModified?.toISOString(),
        };
      });

    // Sort by filename (or last modified)
    files.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(files);
  } catch (error) {
    console.error('Error fetching R2 files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

#!/usr/bin/env tsx
/**
 * Generate static metadata file for R2 files
 * This is needed for static site exports where API routes don't work
 * 
 * Usage:
 *   tsx scripts/generate-r2-metadata.ts
 * 
 * This will create src/data/r2-metadata.json with all R2 file listings
 */

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { DRIVE_FOLDERS } from '../src/data/mock-data';
import * as fs from 'fs';
import * as path from 'path';

interface R2FileMetadata {
  id: string;
  name: string;
  key: string;
  url: string;
  thumbnailUrl: string;
  size?: number;
  uploadedAt?: string;
}

interface CategoryMetadata {
  categoryId: string;
  files: R2FileMetadata[];
}

interface R2Metadata {
  categories: CategoryMetadata[];
  generatedAt: string;
}

// Initialize R2 client
function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('Missing R2 configuration. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY environment variables.');
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

async function generateMetadata() {
  console.log('🔄 Generating R2 metadata file...\n');

  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

  if (!bucketName || !publicUrl) {
    console.error('❌ Error: R2_BUCKET_NAME and R2_PUBLIC_URL must be set');
    process.exit(1);
  }

  let client: S3Client;
  try {
    client = getR2Client();
  } catch (error) {
    console.error('❌ Error initializing R2 client:', error);
    process.exit(1);
  }

  const metadata: R2Metadata = {
    categories: [],
    generatedAt: new Date().toISOString(),
  };

  const baseUrl = publicUrl.replace(/\/$/, '');

  // Process each category
  for (const [categoryId, folderId] of Object.entries(DRIVE_FOLDERS)) {
    if (!folderId) {
      console.log(`⏭️  Skipping ${categoryId} (no folder ID)`);
      continue;
    }

    console.log(`📁 Processing category: ${categoryId}`);

    try {
      // List objects in the category folder
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: `${categoryId}/`,
      });

      const response = await client.send(command);

      const files: R2FileMetadata[] = (response.Contents || [])
        .filter((obj) => {
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

      // Sort by filename
      files.sort((a, b) => a.name.localeCompare(b.name));

      metadata.categories.push({
        categoryId,
        files,
      });

      console.log(`   ✓ Found ${files.length} files\n`);
    } catch (error) {
      console.error(`   ✗ Error: ${error}\n`);
    }
  }

  // Write metadata file
  const outputPath = path.join(process.cwd(), 'src/data/r2-metadata.json');
  fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2));

  console.log(`✅ Metadata file generated: ${outputPath}`);
  console.log(`   Total categories: ${metadata.categories.length}`);
  console.log(`   Total files: ${metadata.categories.reduce((sum, cat) => sum + cat.files.length, 0)}`);
}

generateMetadata().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

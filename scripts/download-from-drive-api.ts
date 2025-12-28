#!/usr/bin/env tsx
/**
 * Alternative download method using Google Drive API
 * This requires a Google Drive API key
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { DRIVE_FOLDERS } from '../src/data/mock-data';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

// Initialize R2 client
function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('Missing R2 configuration');
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

// Download using Google Drive API (requires API key)
async function downloadWithAPI(fileId: string, apiKey: string, outputPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    const file = fs.createWriteStream(outputPath);
    let bytesDownloaded = 0;
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.end();
        fs.unlinkSync(outputPath);
        resolve(false);
        return;
      }
      
      response.on('data', (chunk) => {
        bytesDownloaded += chunk.length;
        file.write(chunk);
      });
      
      response.on('end', () => {
        file.end();
        resolve(bytesDownloaded > 1000);
      });
      
      response.on('error', () => {
        file.end();
        fs.unlinkSync(outputPath);
        resolve(false);
      });
    }).on('error', () => {
      fs.unlinkSync(outputPath);
      resolve(false);
    });
  });
}

// Try to download using thumbnail URL (works for public files)
async function downloadViaThumbnail(fileId: string, outputPath: string): Promise<boolean> {
  // Try to get full resolution by removing size parameter
  const urls = [
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w0-h0`, // Full size
    `https://lh3.googleusercontent.com/d/${fileId}=w0-h0`, // Alternative
  ];
  
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        if (buffer.byteLength > 1000) {
          fs.writeFileSync(outputPath, Buffer.from(buffer));
          return true;
        }
      }
    } catch {
      continue;
    }
  }
  
  return false;
}

async function main() {
  console.log('🔄 Alternative Photo Upload Method');
  console.log('==================================\n');
  
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  const bucketName = process.env.R2_BUCKET_NAME || 'dugunresimleri';
  const client = getR2Client();
  const tempDir = path.join(process.cwd(), '.temp-migration');
  
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // This is a placeholder - you'll need to provide file IDs
  console.log('Note: This script requires either:');
  console.log('1. GOOGLE_DRIVE_API_KEY environment variable');
  console.log('2. Or manually uploaded photos to R2');
  console.log('\nFor now, please upload photos manually via Cloudflare Dashboard.');
}

if (require.main === module) {
  main().catch(console.error);
}

#!/usr/bin/env tsx
/**
 * Migration script to download photos from Google Drive and upload to Cloudflare R2
 * 
 * Usage:
 *   tsx scripts/migrate-to-r2.ts
 * 
 * Required environment variables:
 *   - R2_ACCOUNT_ID: Cloudflare account ID
 *   - R2_ACCESS_KEY_ID: R2 access key ID
 *   - R2_SECRET_ACCESS_KEY: R2 secret access key
 *   - R2_BUCKET_NAME: R2 bucket name
 *   - R2_PUBLIC_URL: Public URL for the R2 bucket (e.g., https://your-bucket.r2.dev)
 *   - GOOGLE_DRIVE_API_KEY: (Optional) Google Drive API key for reliable downloads
 */

import { S3Client, PutObjectCommand, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { DRIVE_FOLDERS } from '../src/data/mock-data';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

interface DriveFile {
  id: string;
  name: string;
}

interface MigrationStats {
  total: number;
  uploaded: number;
  skipped: number;
  failed: number;
  errors: string[];
}

// Initialize R2 client (R2 is S3-compatible)
function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error('Missing R2 configuration. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME environment variables.');
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

// Fetch files from Google Drive folder using API (if API key available) or embedded view
async function fetchDriveFolderFiles(folderId: string): Promise<DriveFile[]> {
  console.log(`\n📁 Fetching files from Google Drive folder: ${folderId}`);
  
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  
  // If API key is available, use the Drive API for reliable listing
  if (apiKey) {
    try {
      const apiUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(id,name,mimeType)&key=${apiKey}&pageSize=1000`;
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        const files: DriveFile[] = (data.files || [])
          .filter((f: { name: string; mimeType: string }) => 
            f.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(f.name)
          )
          .map((f: { id: string; name: string }) => ({ id: f.id, name: f.name }));
        
        console.log(`   Found ${files.length} image files (via API)`);
        return files;
      }
    } catch (error) {
      console.log(`   API failed, falling back to embedded view`);
    }
  }
  
  // Fall back to embedded folder view
  try {
    const proxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://drive.google.com/embeddedfolderview?id=${folderId}`)}`,
      `https://corsproxy.io/?${encodeURIComponent(`https://drive.google.com/embeddedfolderview?id=${folderId}`)}`,
    ];

    let html = '';
    for (const proxyUrl of proxies) {
      try {
        const response = await fetch(proxyUrl);
        if (response.ok) {
          html = await response.text();
          if (html && html.length > 100) {
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }

    if (!html || html.length < 100) {
      throw new Error('Failed to fetch folder HTML');
    }

    // Parse files from HTML
    const files: DriveFile[] = [];
    const patterns = [
      /id="entry-([a-zA-Z0-9_-]+)"[\s\S]*?flip-entry-title">([^<]+)</g,
      /data-id="([a-zA-Z0-9_-]+)"[\s\S]*?title="([^"]+)"/g,
    ];

    for (const regex of patterns) {
      let match;
      while ((match = regex.exec(html)) !== null) {
        const fileId = match[1];
        const fileName = match[2];
        
        if (fileId.length > 20 && /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(fileName)) {
          if (!files.find(f => f.id === fileId)) {
            files.push({ id: fileId, name: fileName });
          }
        }
      }
    }

    console.log(`   Found ${files.length} image files`);
    return files;
  } catch (error) {
    console.error(`   Error fetching folder:`, error);
    return [];
  }
}

// Helper to make HTTPS request with redirect following
function httpsRequest(url: string, options: https.RequestOptions = {}): Promise<{ statusCode: number; headers: Record<string, string | string[] | undefined>; data: Buffer }> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions: https.RequestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/*,*/*;q=0.9',
        'Accept-Language': 'en-US,en;q=0.9',
        ...options.headers,
      },
      ...options,
    };

    const req = https.request(reqOptions, (res) => {
      // Handle redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http') 
          ? res.headers.location 
          : new URL(res.headers.location, url).toString();
        httpsRequest(redirectUrl, options).then(resolve).catch(reject);
        return;
      }

      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers as Record<string, string | string[] | undefined>,
          data: Buffer.concat(chunks),
        });
      });
      res.on('error', reject);
    });

    req.on('error', reject);
    req.setTimeout(60000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

// Download file from Google Drive with proper handling for large files
async function downloadDriveFile(fileId: string, fileName: string, outputPath: string): Promise<boolean> {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  
  // Strategy 1: Use Google Drive API with API key (most reliable for public files)
  if (apiKey) {
    try {
      // Get file metadata first
      const metaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=size,mimeType&key=${apiKey}`;
      const metaResponse = await httpsRequest(metaUrl);
      
      if (metaResponse.statusCode === 200) {
        // Download using API
        const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
        const response = await httpsRequest(downloadUrl);
        
        if (response.statusCode === 200 && response.data.length > 1000) {
          fs.writeFileSync(outputPath, response.data);
          return true;
        }
      }
    } catch (error) {
      console.log(`      API download failed, trying fallback methods...`);
    }
  }
  
  // Strategy 2: Use lh3.googleusercontent.com (works for shared photos)
  try {
    // Try full resolution first, then progressively lower
    const googleUserContentUrls = [
      `https://lh3.googleusercontent.com/d/${fileId}=s0`,  // Original size
      `https://lh3.googleusercontent.com/d/${fileId}=w0`,  // Max width
      `https://lh3.googleusercontent.com/d/${fileId}=w2048`,  // 2048px width
      `https://lh3.googleusercontent.com/d/${fileId}`,  // Default size
    ];
    
    for (const url of googleUserContentUrls) {
      try {
        const response = await httpsRequest(url);
        
        if (response.statusCode === 200 && response.data.length > 5000) {
          // Verify it's an image
          const isImage = (
            (response.data[0] === 0xFF && response.data[1] === 0xD8) || // JPEG
            (response.data[0] === 0x89 && response.data[1] === 0x50) || // PNG
            response.data.slice(4, 8).toString() === 'ftyp' ||  // HEIC/HEIF
            (response.data[0] === 0x47 && response.data[1] === 0x49 && response.data[2] === 0x46) // GIF
          );
          
          if (isImage) {
            fs.writeFileSync(outputPath, response.data);
            return true;
          }
        }
      } catch (e) {
        continue;
      }
    }
  } catch (error) {
    console.log(`      GoogleUserContent fallback failed`);
  }
  
  // Strategy 3: Direct download with virus scan bypass
  try {
    // First request to get the download page
    const initialUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const initialResponse = await httpsRequest(initialUrl);
    
    if (initialResponse.statusCode === 200) {
      const contentType = (initialResponse.headers['content-type'] as string) || '';
      
      // If we got the actual file (small files)
      if (!contentType.includes('text/html') && initialResponse.data.length > 1000) {
        fs.writeFileSync(outputPath, initialResponse.data);
        return true;
      }
      
      // For large files, Google shows a warning page - extract confirmation token
      const html = initialResponse.data.toString();
      
      // Look for various confirmation patterns
      const patterns = [
        /confirm=([0-9A-Za-z_-]+)/,
        /name="confirm" value="([^"]+)"/,
        /id="uc-download-link"[^>]*href="[^"]*confirm=([^&"]+)/,
        /&amp;confirm=([^&]+)/,
        /uuid=([0-9a-f-]+)/,
      ];
      
      let confirmToken = '';
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) {
          confirmToken = match[1];
          break;
        }
      }
      
      if (confirmToken) {
        // Download with confirmation token
        const confirmUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${confirmToken}`;
        const confirmResponse = await httpsRequest(confirmUrl);
        
        if (confirmResponse.statusCode === 200 && confirmResponse.data.length > 1000) {
          const ct = (confirmResponse.headers['content-type'] as string) || '';
          if (!ct.includes('text/html')) {
            fs.writeFileSync(outputPath, confirmResponse.data);
            return true;
          }
        }
      }
    }
  } catch (error) {
    console.log(`      Direct download failed`);
  }
  
  console.error(`      ✗ All download methods failed for ${fileName}`);
  return false;
}

// Upload file to R2
async function uploadToR2(
  client: S3Client,
  bucketName: string,
  key: string,
  filePath: string,
  contentType: string
): Promise<boolean> {
  try {
    const fileContent = fs.readFileSync(filePath);
    
    await client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000', // 1 year cache
    }));
    
    return true;
  } catch (error) {
    console.error(`   Upload failed for ${key}:`, error);
    return false;
  }
}

// Check if file exists in R2
async function fileExistsInR2(client: S3Client, bucketName: string, key: string): Promise<boolean> {
  try {
    await client.send(new HeadObjectCommand({
      Bucket: bucketName,
      Key: key,
    }));
    return true;
  } catch {
    return false;
  }
}

// Get content type from filename
function getContentType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const types: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.heic': 'image/heic',
  };
  return types[ext] || 'application/octet-stream';
}

// Migrate a single category
async function migrateCategory(
  categoryId: string,
  folderId: string,
  client: S3Client,
  bucketName: string,
  tempDir: string
): Promise<MigrationStats> {
  console.log(`\n🚀 Migrating category: ${categoryId}`);
  
  const stats: MigrationStats = {
    total: 0,
    uploaded: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  // Fetch files from Drive
  const files = await fetchDriveFolderFiles(folderId);
  stats.total = files.length;

  if (files.length === 0) {
    console.log(`   No files found in folder`);
    return stats;
  }

  // Process each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const key = `${categoryId}/${file.name}`;
    
    console.log(`   [${i + 1}/${files.length}] Processing: ${file.name}`);

    // Check if already uploaded and has content
    const exists = await fileExistsInR2(client, bucketName, key);
    if (exists) {
      // Check file size - if it's 0 or very small, re-upload
      try {
        const headCommand = new HeadObjectCommand({
          Bucket: bucketName,
          Key: key,
        });
        const headResponse = await client.send(headCommand);
        const fileSize = headResponse.ContentLength || 0;
        
        if (fileSize > 1000) { // File has content (>1KB)
          console.log(`      ✓ Already exists in R2 (${(fileSize / 1024).toFixed(1)}KB), skipping`);
          stats.skipped++;
          continue;
        } else {
          console.log(`      ⚠ File exists but is empty/small (${fileSize} bytes), re-uploading...`);
          // Delete empty file first
          try {
            const deleteCommand = new DeleteObjectCommand({
              Bucket: bucketName,
              Key: key,
            });
            await client.send(deleteCommand);
            console.log(`      ✓ Deleted empty file`);
          } catch (deleteError) {
            console.log(`      ⚠ Could not delete empty file, will overwrite`);
          }
        }
      } catch (error) {
        // If we can't check size, try to re-upload
        console.log(`      ⚠ Could not verify file size, re-uploading...`);
      }
    }

    // Download from Drive
    const tempPath = path.join(tempDir, `${file.id}_${file.name}`);
    console.log(`      Downloading from Drive...`);
    
    const downloaded = await downloadDriveFile(file.id, file.name, tempPath);
    if (!downloaded) {
      console.log(`      ✗ Download failed`);
      stats.failed++;
      stats.errors.push(`Failed to download ${file.name}`);
      continue;
    }

    // Upload to R2
    console.log(`      Uploading to R2...`);
    const contentType = getContentType(file.name);
    const uploaded = await uploadToR2(client, bucketName, key, tempPath, contentType);
    
    // Clean up temp file
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }

    if (uploaded) {
      console.log(`      ✓ Uploaded successfully`);
      stats.uploaded++;
    } else {
      console.log(`      ✗ Upload failed`);
      stats.failed++;
      stats.errors.push(`Failed to upload ${file.name}`);
    }
  }

  return stats;
}

// Main migration function
async function main() {
  console.log('🔄 Starting migration from Google Drive to Cloudflare R2\n');

  // Check R2 configuration
  const bucketName = process.env.R2_BUCKET_NAME;
  if (!bucketName) {
    console.error('❌ Error: R2_BUCKET_NAME environment variable is required');
    process.exit(1);
  }

  // Initialize R2 client
  let client: S3Client;
  try {
    client = getR2Client();
  } catch (error) {
    console.error('❌ Error initializing R2 client:', error);
    process.exit(1);
  }

  // Create temp directory
  const tempDir = path.join(process.cwd(), '.temp-migration');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Migrate each category
  const allStats: MigrationStats = {
    total: 0,
    uploaded: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  for (const [categoryId, folderId] of Object.entries(DRIVE_FOLDERS)) {
    if (!folderId) {
      console.log(`\n⏭️  Skipping ${categoryId} (no folder ID)`);
      continue;
    }

    const stats = await migrateCategory(categoryId, folderId, client, bucketName, tempDir);
    
    allStats.total += stats.total;
    allStats.uploaded += stats.uploaded;
    allStats.skipped += stats.skipped;
    allStats.failed += stats.failed;
    allStats.errors.push(...stats.errors);
  }

  // Clean up temp directory
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Migration Summary');
  console.log('='.repeat(60));
  console.log(`Total files: ${allStats.total}`);
  console.log(`✓ Uploaded: ${allStats.uploaded}`);
  console.log(`⏭️  Skipped (already exists): ${allStats.skipped}`);
  console.log(`✗ Failed: ${allStats.failed}`);
  
  if (allStats.errors.length > 0) {
    console.log('\n❌ Errors:');
    allStats.errors.forEach(err => console.log(`   - ${err}`));
  }
  
  console.log('\n✅ Migration complete!');
}

// Run migration
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

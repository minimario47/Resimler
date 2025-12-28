# Migration Guide: Google Drive to Cloudflare R2

This guide will help you migrate your photos from Google Drive to Cloudflare R2 for faster loading times.

## Why Cloudflare R2?

- **Faster downloads**: R2 is backed by Cloudflare's global CDN, providing much faster image delivery
- **Better reliability**: No dependency on Google Drive API rate limits or CORS issues
- **Cost-effective**: Generous free tier (10GB storage, unlimited egress)
- **S3-compatible**: Uses standard S3 API, easy to work with

## Prerequisites

1. A Cloudflare account (free tier works)
2. Node.js and npm installed
3. Terminal access

## Step 1: Set Up Cloudflare R2

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2** in the sidebar
3. Click **Create bucket**
4. Name your bucket (e.g., `wedding-photos`)
5. Choose a location (closest to your users)
6. Click **Create bucket**

## Step 2: Get R2 API Credentials

1. In the R2 dashboard, click **Manage R2 API Tokens**
2. Click **Create API Token**
3. Give it a name (e.g., `wedding-photos-migration`)
4. Set permissions to **Object Read & Write**
5. Click **Create API Token**
6. **Important**: Copy these values immediately (you won't see them again):
   - Account ID
   - Access Key ID
   - Secret Access Key

## Step 3: Set Up Public Access (Custom Domain or R2.dev)

You have two options:

### Option A: Use R2.dev Subdomain (Easiest)

1. In your bucket settings, enable **Public Access**
2. Copy the R2.dev subdomain URL (e.g., `https://your-bucket.r2.dev`)

### Option B: Use Custom Domain (Recommended for Production)

1. In your bucket settings, go to **Public Access**
2. Add your custom domain (e.g., `photos.yourdomain.com`)
3. Follow Cloudflare's DNS setup instructions
4. Use your custom domain URL

## Step 4: Configure Environment Variables

Set these environment variables in your terminal or `.env` file:

```bash
export R2_ACCOUNT_ID='your-account-id'
export R2_ACCESS_KEY_ID='your-access-key-id'
export R2_SECRET_ACCESS_KEY='your-secret-key'
export R2_BUCKET_NAME='your-bucket-name'
export R2_PUBLIC_URL='https://your-bucket.r2.dev'
export NEXT_PUBLIC_R2_PUBLIC_URL='https://your-bucket.r2.dev'
```

Or create a `.env` file in the project root:

```env
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://your-bucket.r2.dev
NEXT_PUBLIC_R2_PUBLIC_URL=https://your-bucket.r2.dev
```

## Step 5: Install Dependencies

```bash
npm install
```

This will install the AWS SDK (for R2) and tsx (for running the migration script).

## Step 6: Run the Migration

The migration script will:
1. Download all photos from your Google Drive folders
2. Upload them to Cloudflare R2
3. Organize them by category

```bash
npm run migrate:r2
```

The script will:
- Show progress for each file
- Skip files that already exist in R2 (safe to re-run)
- Provide a summary at the end

**Note**: The migration may take some time depending on:
- Number of photos
- Photo sizes
- Your internet connection speed

## Step 7: Verify Migration

After migration completes:

1. Check the summary output for any errors
2. Visit your R2 bucket in Cloudflare dashboard to verify files are uploaded
3. Test your website - photos should load much faster!

## Step 8: Update Your Application

The application automatically detects if R2 is configured and will use it instead of Google Drive. No code changes needed!

If R2 is configured, it will be used automatically. If not, it falls back to Google Drive.

## Troubleshooting

### Migration fails with "Missing R2 configuration"

Make sure all environment variables are set correctly. Run:
```bash
npm run setup:r2
```

### Photos not showing after migration

1. Check that `NEXT_PUBLIC_R2_PUBLIC_URL` is set correctly
2. Verify your R2 bucket has public access enabled
3. Check browser console for errors

### Slow migration

- The migration downloads and uploads sequentially for reliability
- Large photos will take longer
- You can re-run the migration - it will skip already-uploaded files

### CORS errors

If you're using a custom domain, make sure CORS is configured in R2 bucket settings:
- Allow origin: `*` (or your domain)
- Allow methods: `GET, HEAD`
- Allow headers: `*`

## Rollback

If you need to go back to Google Drive:
1. Remove or comment out the R2 environment variables
2. Restart your application
3. The app will automatically fall back to Google Drive

## Cost Estimate

Cloudflare R2 pricing (as of 2024):
- **Storage**: $0.015 per GB/month (first 10GB free)
- **Class A Operations** (writes): $4.50 per million (first 1M free)
- **Class B Operations** (reads): $0.36 per million (first 10M free)
- **Egress**: FREE (unlimited)

For a typical wedding photo gallery:
- ~500 photos at ~5MB each = ~2.5GB storage
- **Cost: FREE** (within free tier limits)

## Support

If you encounter issues:
1. Check the migration script output for specific errors
2. Verify your R2 credentials are correct
3. Ensure your bucket has public access enabled
4. Check Cloudflare R2 dashboard for any service issues

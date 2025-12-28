# Re-upload Photos to R2

## Problem

The photos in R2 are empty (Content-Length: 0). This happened because the Google Drive download function wasn't properly handling Drive's download flow.

## Solution: Re-run Migration

I've fixed the download function. Now you need to re-run the migration:

### Step 1: Set Environment Variables

```bash
export R2_ACCOUNT_ID='beb8a0d944ffe1af00c2df5797a8d468'
export R2_ACCESS_KEY_ID='5448ab43a66e176e1a242528d1108de1'
export R2_SECRET_ACCESS_KEY='7a4bd4bf40346e70a3897503a410fab5fbd4a75f454ed71851dc2762df6971b5'
export R2_BUCKET_NAME='dugunresimleri'
export R2_PUBLIC_URL='https://pub-b58e3b0a4909459992b84bd69903e2b7.r2.dev'
export NEXT_PUBLIC_R2_PUBLIC_URL='https://pub-b58e3b0a4909459992b84bd69903e2b7.r2.dev'
```

### Step 2: Delete Empty Files (Optional)

You can delete the empty files first, or the migration will skip them if they exist:

```bash
# The migration script checks file size, so empty files will be re-uploaded
```

### Step 3: Re-run Migration

```bash
npm run migrate:r2
```

The fixed download function will:
- Properly handle Google Drive redirects
- Detect HTML pages (virus scan warnings)
- Verify file size before considering download successful
- Use alternative download URLs if needed

### Step 4: Regenerate Metadata

After migration completes:

```bash
npm run generate:r2-metadata
```

### Step 5: Commit and Push

```bash
git add src/data/r2-metadata.json public/r2-metadata.json
git commit -m "Update R2 metadata with properly uploaded photos"
git push origin main
```

## Alternative: Manual Upload

If the migration still doesn't work, you can upload photos manually:

1. Go to Cloudflare Dashboard → R2 → `dugunresimleri` bucket
2. Upload photos to the correct folders:
   - `dugunden-once/` - 154 photos
   - `kina-gecesi/` - 39 photos
   - `dugun/` - 242 photos

## Verify Upload

After re-uploading, verify files have content:

```bash
curl -I "https://pub-b58e3b0a4909459992b84bd69903e2b7.r2.dev/dugunden-once/IMG_1316.jpeg"
```

Should show `Content-Length: [number > 0]` instead of `Content-Length: 0`

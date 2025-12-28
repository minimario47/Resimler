# Complete Fix Guide

## Current Issues

1. **404 Error**: GitHub Pages returning 404
2. **Empty Photos**: Photos in R2 are 0 bytes (Google Drive download failing)

## Solution Summary

### Issue 1: 404 Error Fix

The GitHub Pages deployment should work after the workflow runs. If it still shows 404:

1. Go to: https://github.com/minimario47/Resimler/settings/pages
2. Ensure:
   - Source: "Deploy from a branch"
   - Branch: `gh-pages` 
   - Folder: `/ (root)`
3. Wait 1-2 minutes for GitHub to rebuild

### Issue 2: Photo Upload Fix

Google Drive direct downloads don't work without authentication. Here are your options:

#### Option A: Upload via Cloudflare Dashboard (Easiest - No Computer Needed)

1. Go to: https://dash.cloudflare.com/
2. Navigate to: R2 → `dugunresimleri` bucket
3. Create folders: `dugunden-once/`, `kina-gecesi/`, `dugun/`
4. Upload photos directly from your phone/device to each folder
5. After upload, run:
   ```bash
   npm run generate:r2-metadata
   npm run build
   git add . && git commit -m "Update metadata" && git push
   ```

#### Option B: Use Google Drive API (Requires API Key)

1. Get Google Drive API key:
   - Go to: https://console.cloud.google.com/
   - Create project → Enable Drive API → Create credentials
   - Copy API key

2. Set environment variable:
   ```bash
   export GOOGLE_DRIVE_API_KEY="your-api-key-here"
   ```

3. Update migration script to use API (I can help with this)

#### Option C: Share Drive Folder Differently

If you can make the Drive folder publicly accessible with direct download links, the current script will work.

## Immediate Actions

1. ✅ Fixed deployment workflow
2. ✅ Improved download detection
3. ⏳ Wait for GitHub Actions to deploy
4. ⏳ Upload photos (choose option above)
5. ⏳ Regenerate metadata
6. ⏳ Rebuild and deploy

## Quick Commands (After Photos Uploaded)

```bash
# Regenerate metadata from R2
npm run generate:r2-metadata

# Copy to public folder
cp src/data/r2-metadata.json public/r2-metadata.json

# Build
npm run build

# Commit and push
git add .
git commit -m "Update with uploaded photos"
git push origin main
```

## Status Check

- Check deployment: https://github.com/minimario47/Resimler/actions
- Check site: https://minimario47.github.io/Resimler/
- Check R2 bucket: Cloudflare Dashboard → R2 → dugunresimleri

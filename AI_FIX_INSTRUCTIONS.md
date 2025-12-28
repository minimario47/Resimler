# AI Fix Instructions: GitHub Pages 404 and Photo Migration

## Problem Statement

A Next.js static site deployed to GitHub Pages is experiencing two critical issues:

1. **404 Error**: The site at `https://minimario47.github.io/Resimler/` returns 404 "Page not found" errors
2. **Empty Photos**: Photos uploaded to Cloudflare R2 are 0 bytes (empty files), causing no images to display

## Current Setup

- **Repository**: `minimario47/Resimler`
- **Deployment**: GitHub Pages via GitHub Actions workflow
- **Build**: Next.js 16.1.1 with static export (`output: 'export'`)
- **Base Path**: `/Resimler` (configured for GitHub Pages subdirectory)
- **Photo Storage**: Cloudflare R2 bucket `dugunresimleri`
- **R2 Public URL**: `https://pub-b58e3b0a4909459992b84bd69903e2b7.r2.dev`
- **Source Photos**: Google Drive folders (IDs defined in `src/lib/google-drive.ts`)

## Root Causes

### Issue 1: 404 Error
- GitHub Pages is configured to serve from `gh-pages` branch
- The deployment workflow (`peaceiris/actions-gh-pages@v4`) publishes `./out` directory to `gh-pages` branch
- Files may not be at the correct path or GitHub Pages settings may be incorrect
- Need to verify: GitHub Pages source is set to `gh-pages` branch with `/` path

### Issue 2: Empty Photos
- Migration script (`scripts/migrate-to-r2.ts`) downloads from Google Drive and uploads to R2
- Google Drive direct download URLs (`https://drive.google.com/uc?export=download&id=...`) return HTML warning pages instead of actual files
- The download function tries multiple methods but all fail, resulting in 0-byte uploads
- Need to implement a working Google Drive download method

## Required Fixes

### Fix 1: Resolve 404 Error

**Steps:**
1. Check GitHub Pages configuration:
   ```bash
   gh api repos/minimario47/Resimler/pages
   ```
   Verify it shows:
   - `source.branch`: `"gh-pages"`
   - `source.path`: `"/"` (not `"/Resimler"`)

2. If path is wrong, update it (requires admin access - may need manual fix):
   - Go to: https://github.com/minimario47/Resimler/settings/pages
   - Ensure: Source = `gh-pages` branch, Path = `/ (root)`

3. Verify deployment workflow is copying files correctly:
   - Check `.github/workflows/deploy.yml`
   - Ensure `publish_dir: ./out` is correct
   - The action should copy contents of `out/` to root of `gh-pages` branch

4. Test locally:
   ```bash
   npm run build
   ls -la out/index.html  # Should exist
   ```

5. Trigger a new deployment:
   ```bash
   git commit --allow-empty -m "Trigger deployment"
   git push origin main
   ```

6. Wait for GitHub Actions to complete, then verify:
   ```bash
   curl -I https://minimario47.github.io/Resimler/
   # Should return 200, not 404
   ```

### Fix 2: Fix Photo Downloads and Re-upload

**Steps:**

1. **Check current R2 files**:
   ```bash
   export R2_ACCOUNT_ID='beb8a0d944ffe1af00c2df5797a8d468'
   export R2_ACCESS_KEY_ID='5448ab43a66e176e1a242528d1108de1'
   export R2_SECRET_ACCESS_KEY='7a4bd4bf40346e70a3897503a410fab5fbd4a75f454ed71851dc2762df6971b5'
   export R2_BUCKET_NAME='dugunresimleri'
   
   # List files and check sizes
   npm run check:r2
   ```

2. **Implement working Google Drive download**:

   **Option A: Use Google Drive API (Recommended)**
   - Requires Google Drive API key
   - Update `scripts/migrate-to-r2.ts` to use API:
     ```typescript
     const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
     ```
   - Set environment variable: `GOOGLE_DRIVE_API_KEY`
   - If API key not available, skip to Option B

   **Option B: Use gdown or similar tool**
   - Install Python `gdown` package
   - Use it to download files reliably
   - Or use Node.js equivalent

   **Option C: Parse Google Drive sharing page**
   - Use the embedded folder view HTML parsing (already exists in `src/lib/google-drive.ts`)
   - Extract direct download links from the HTML
   - Use those links instead of direct `uc?export=download` URLs

3. **Update migration script** (`scripts/migrate-to-r2.ts`):
   - Implement one of the download methods above
   - Add verification: check downloaded file size before upload
   - Add retry logic for failed downloads
   - Delete empty files from R2 before re-uploading

4. **Run migration**:
   ```bash
   export R2_ACCOUNT_ID='beb8a0d944ffe1af00c2df5797a8d468'
   export R2_ACCESS_KEY_ID='5448ab43a66e176e1a242528d1108de1'
   export R2_SECRET_ACCESS_KEY='7a4bd4bf40346e70a3897503a410fab5fbd4a75f454ed71851dc2762df6971b5'
   export R2_BUCKET_NAME='dugunresimleri'
   export R2_PUBLIC_URL='https://pub-b58e3b0a4909459992b84bd69903e2b7.r2.dev'
   export NEXT_PUBLIC_R2_PUBLIC_URL='https://pub-b58e3b0a4909459992b84bd69903e2b7.r2.dev'
   
   npm run migrate:r2
   ```

5. **Verify uploads**:
   ```bash
   # Check file sizes in R2
   npm run check:r2
   # Should show files > 1KB, not 0 bytes
   ```

6. **Regenerate metadata**:
   ```bash
   npm run generate:r2-metadata
   cp src/data/r2-metadata.json public/r2-metadata.json
   ```

7. **Rebuild and deploy**:
   ```bash
   npm run build
   git add .
   git commit -m "Fix photo uploads - re-upload all photos"
   git push origin main
   ```

## Files to Modify

1. **`scripts/migrate-to-r2.ts`**:
   - Fix `downloadDriveFile()` function to use working download method
   - Add better error handling and retry logic
   - Verify file size before upload

2. **`.github/workflows/deploy.yml`** (if needed):
   - Verify deployment configuration
   - Ensure files are copied correctly

3. **`next.config.ts`** (already fixed, but verify):
   - Should use webpack, not Turbopack
   - Base path configured correctly

## Testing Checklist

- [ ] GitHub Pages returns 200 (not 404) for `https://minimario47.github.io/Resimler/`
- [ ] Site loads correctly with all pages accessible
- [ ] R2 files have non-zero sizes (check via `npm run check:r2`)
- [ ] Photos display correctly on category pages
- [ ] Metadata file (`r2-metadata.json`) exists and contains file listings
- [ ] All three categories have photos: `dugunden-once`, `kina-gecesi`, `dugun`

## Environment Variables Needed

```bash
# R2 Configuration (already set in GitHub Secrets)
R2_ACCOUNT_ID=beb8a0d944ffe1af00c2df5797a8d468
R2_ACCESS_KEY_ID=5448ab43a66e176e1a242528d1108de1
R2_SECRET_ACCESS_KEY=7a4bd4bf40346e70a3897503a410fab5fbd4a75f454ed71851dc2762df6971b5
R2_BUCKET_NAME=dugunresimleri
R2_PUBLIC_URL=https://pub-b58e3b0a4909459992b84bd69903e2b7.r2.dev
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-b58e3b0a4909459992b84bd69903e2b7.r2.dev

# Optional: Google Drive API (if using API method)
GOOGLE_DRIVE_API_KEY=<if available>
```

## Expected Outcome

After fixes:
1. Site accessible at `https://minimario47.github.io/Resimler/` without 404 errors
2. All photos properly uploaded to R2 (non-zero file sizes)
3. Photos display correctly on the website
4. Metadata file contains correct file listings
5. All categories show thumbnails and photos

## Notes

- The migration script already has logic to detect and delete empty files
- The download function has been improved but still fails - needs a different approach
- Google Drive folders are defined in `src/lib/google-drive.ts`:
  - `dugunden-once`: folder ID `147X9FoyAczw0zvSe2vS7SuZLhr7VLate`
  - Other folders may need IDs added
- The site uses static export, so all data must be available at build time
- R2 metadata is generated as a static JSON file for client-side access

## Priority Order

1. **First**: Fix 404 error (verify GitHub Pages configuration and deployment)
2. **Second**: Fix photo downloads (implement working Google Drive download method)
3. **Third**: Re-run migration and verify all photos upload correctly
4. **Fourth**: Regenerate metadata and rebuild site

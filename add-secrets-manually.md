# How to Add GitHub Secrets Manually

Since the GitHub CLI doesn't have admin permissions, you need to add the secrets through the GitHub web interface. Here's how:

## Quick Steps:

1. **Go to your repository secrets page:**
   ```
   https://github.com/minimario47/Resimler/settings/secrets/actions
   ```

2. **Click "New repository secret"** for each secret below:

### Secret 1: R2_ACCOUNT_ID
- **Name:** `R2_ACCOUNT_ID`
- **Value:** `beb8a0d944ffe1af00c2df5797a8d468`

### Secret 2: R2_ACCESS_KEY_ID
- **Name:** `R2_ACCESS_KEY_ID`
- **Value:** `5448ab43a66e176e1a242528d1108de1`

### Secret 3: R2_SECRET_ACCESS_KEY
- **Name:** `R2_SECRET_ACCESS_KEY`
- **Value:** `7a4bd4bf40346e70a3897503a410fab5fbd4a75f454ed71851dc2762df6971b5`

### Secret 4: R2_BUCKET_NAME
- **Name:** `R2_BUCKET_NAME`
- **Value:** `dugunresimleri`

## Alternative: Use GitHub CLI with Proper Permissions

If you have admin access and want to use CLI, you need to authenticate with a token that has `admin:repo` scope:

```bash
# First, create a personal access token with admin:repo scope
# Then authenticate:
gh auth login --with-token < your-token.txt

# Then set secrets:
gh secret set R2_ACCOUNT_ID --body "beb8a0d944ffe1af00c2df5797a8d468" --repo minimario47/Resimler
gh secret set R2_ACCESS_KEY_ID --body "5448ab43a66e176e1a242528d1108de1" --repo minimario47/Resimler
gh secret set R2_SECRET_ACCESS_KEY --body "7a4bd4bf40346e70a3897503a410fab5fbd4a75f454ed71851dc2762df6971b5" --repo minimario47/Resimler
gh secret set R2_BUCKET_NAME --body "dugunresimleri" --repo minimario47/Resimler
```

## Verify Secrets Are Set

After adding, you can verify by:
1. Going to: https://github.com/minimario47/Resimler/settings/secrets/actions
2. You should see all 4 secrets listed

## What Happens Next

Once secrets are added:
- The GitHub Actions workflow will automatically use them
- R2 metadata will be generated during build
- Your site will use fast R2 CDN for images

## Note

If secrets are not set, the workflow will still run but will skip R2 metadata generation and fall back to Google Drive (slower but works).

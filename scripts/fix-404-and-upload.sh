#!/bin/bash
# Script to fix 404 and re-upload photos

set -e

echo "🔧 Fixing 404 and Re-uploading Photos"
echo "======================================"

# Set R2 credentials
export R2_ACCOUNT_ID='beb8a0d944ffe1af00c2df5797a8d468'
export R2_ACCESS_KEY_ID='5448ab43a66e176e1a242528d1108de1'
export R2_SECRET_ACCESS_KEY='7a4bd4bf40346e70a3897503a410fab5fbd4a75f454ed71851dc2762df6971b5'
export R2_BUCKET_NAME='dugunresimleri'
export R2_PUBLIC_URL='https://pub-b58e3b0a4909459992b84bd69903e2b7.r2.dev'
export NEXT_PUBLIC_R2_PUBLIC_URL='https://pub-b58e3b0a4909459992b84bd69903e2b7.r2.dev'

echo ""
echo "Step 1: Re-uploading photos with fixed download function..."
npm run migrate:r2

echo ""
echo "Step 2: Regenerating metadata..."
npm run generate:r2-metadata

echo ""
echo "Step 3: Copying metadata to public folder..."
cp src/data/r2-metadata.json public/r2-metadata.json

echo ""
echo "Step 4: Building site..."
npm run build

echo ""
echo "✅ Done! Now commit and push:"
echo "  git add ."
echo "  git commit -m 'Fix 404 and re-upload photos'"
echo "  git push origin main"

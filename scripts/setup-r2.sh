#!/bin/bash
# Setup script for Cloudflare R2 migration
# This script helps configure R2 credentials

set -e

echo "🚀 Cloudflare R2 Setup for Photo Migration"
echo "============================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    touch .env
fi

echo "To set up Cloudflare R2, you need:"
echo "1. A Cloudflare account (free tier works)"
echo "2. An R2 bucket created"
echo "3. API tokens with R2 access"
echo ""
echo "Steps:"
echo "1. Go to https://dash.cloudflare.com"
echo "2. Navigate to R2 > Create bucket"
echo "3. Create a bucket (e.g., 'wedding-photos')"
echo "4. Go to Manage R2 API Tokens > Create API Token"
echo "5. Copy the Account ID, Access Key ID, and Secret Access Key"
echo "6. Set up a custom domain or use the R2.dev subdomain"
echo ""
echo "After you have the credentials, run:"
echo ""
echo "export R2_ACCOUNT_ID='your-account-id'"
echo "export R2_ACCESS_KEY_ID='your-access-key-id'"
echo "export R2_SECRET_ACCESS_KEY='your-secret-key'"
echo "export R2_BUCKET_NAME='your-bucket-name'"
echo "export R2_PUBLIC_URL='https://your-bucket.r2.dev'"
echo "export NEXT_PUBLIC_R2_PUBLIC_URL='https://your-bucket.r2.dev'"
echo ""
echo "Or add them to your .env file:"
echo ""
echo "R2_ACCOUNT_ID=your-account-id"
echo "R2_ACCESS_KEY_ID=your-access-key-id"
echo "R2_SECRET_ACCESS_KEY=your-secret-key"
echo "R2_BUCKET_NAME=your-bucket-name"
echo "R2_PUBLIC_URL=https://your-bucket.r2.dev"
echo "NEXT_PUBLIC_R2_PUBLIC_URL=https://your-bucket.r2.dev"
echo ""
echo "Then run: npm run migrate:r2"
echo ""

# Check if credentials are already set
if [ -n "$R2_ACCOUNT_ID" ] && [ -n "$R2_ACCESS_KEY_ID" ] && [ -n "$R2_SECRET_ACCESS_KEY" ] && [ -n "$R2_BUCKET_NAME" ]; then
    echo "✅ R2 credentials detected in environment"
    echo ""
    echo "You can now run the migration:"
    echo "  npm run migrate:r2"
else
    echo "⚠️  R2 credentials not found in environment"
    echo "Please set them up as described above"
fi

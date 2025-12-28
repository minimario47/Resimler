#!/bin/bash
# Automated installation and migration script
# This script installs dependencies and runs the migration

set -e

echo "🚀 Starting R2 Migration Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"
echo ""

# Check for R2 credentials
if [ -z "$R2_ACCOUNT_ID" ] || [ -z "$R2_ACCESS_KEY_ID" ] || [ -z "$R2_SECRET_ACCESS_KEY" ] || [ -z "$R2_BUCKET_NAME" ]; then
    echo "⚠️  R2 credentials not found in environment"
    echo ""
    echo "Please set the following environment variables:"
    echo "  export R2_ACCOUNT_ID='your-account-id'"
    echo "  export R2_ACCESS_KEY_ID='your-access-key-id'"
    echo "  export R2_SECRET_ACCESS_KEY='your-secret-key'"
    echo "  export R2_BUCKET_NAME='your-bucket-name'"
    echo "  export R2_PUBLIC_URL='https://your-bucket.r2.dev'"
    echo "  export NEXT_PUBLIC_R2_PUBLIC_URL='https://your-bucket.r2.dev'"
    echo ""
    echo "Or run: npm run setup:r2"
    exit 1
fi

echo "✅ R2 credentials found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Dependencies installed"
echo ""

# Run migration
echo "🔄 Starting migration..."
echo ""
npm run migrate:r2

echo ""
echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Verify photos in your Cloudflare R2 bucket"
echo "2. Test your website - photos should load faster now!"
echo "3. If everything works, you can remove Google Drive folder IDs from your code"

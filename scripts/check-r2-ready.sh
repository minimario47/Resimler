#!/bin/bash
# Check if R2 migration is ready to run

echo "🔍 Checking R2 Migration Readiness"
echo "=================================="
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js: Not installed"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm: Not installed"
    exit 1
fi

# Check dependencies
if [ -d "node_modules" ]; then
    echo "✅ Dependencies: Installed"
else
    echo "⚠️  Dependencies: Not installed (run: npm install)"
fi

# Check R2 credentials
echo ""
echo "R2 Configuration:"
if [ -n "$R2_ACCOUNT_ID" ]; then
    echo "✅ R2_ACCOUNT_ID: Set"
else
    echo "❌ R2_ACCOUNT_ID: Not set"
fi

if [ -n "$R2_ACCESS_KEY_ID" ]; then
    echo "✅ R2_ACCESS_KEY_ID: Set"
else
    echo "❌ R2_ACCESS_KEY_ID: Not set"
fi

if [ -n "$R2_SECRET_ACCESS_KEY" ]; then
    echo "✅ R2_SECRET_ACCESS_KEY: Set"
else
    echo "❌ R2_SECRET_ACCESS_KEY: Not set"
fi

if [ -n "$R2_BUCKET_NAME" ]; then
    echo "✅ R2_BUCKET_NAME: Set ($R2_BUCKET_NAME)"
else
    echo "❌ R2_BUCKET_NAME: Not set"
fi

if [ -n "$R2_PUBLIC_URL" ]; then
    echo "✅ R2_PUBLIC_URL: Set ($R2_PUBLIC_URL)"
else
    echo "❌ R2_PUBLIC_URL: Not set"
fi

if [ -n "$NEXT_PUBLIC_R2_PUBLIC_URL" ]; then
    echo "✅ NEXT_PUBLIC_R2_PUBLIC_URL: Set ($NEXT_PUBLIC_R2_PUBLIC_URL)"
else
    echo "❌ NEXT_PUBLIC_R2_PUBLIC_URL: Not set"
fi

echo ""
if [ -n "$R2_ACCOUNT_ID" ] && [ -n "$R2_ACCESS_KEY_ID" ] && [ -n "$R2_SECRET_ACCESS_KEY" ] && [ -n "$R2_BUCKET_NAME" ] && [ -n "$R2_PUBLIC_URL" ]; then
    echo "✅ Ready to migrate! Run: npm run migrate:r2"
else
    echo "⚠️  Not ready. Please set R2 credentials first."
    echo ""
    echo "See MIGRATION_GUIDE.md for instructions."
fi

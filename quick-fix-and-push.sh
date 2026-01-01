#!/bin/bash

# Quick fix and push TypeScript/ESLint errors
set -e

echo "🔧 Committing TypeScript/ESLint fixes..."

git add .

git commit -m "fix: resolve TypeScript and ESLint errors for production build

- Remove unused setLosses state in entry-list
- Prefix unused error variables with underscore
- Remove unused formatNumber import
- Change empty interfaces to type aliases (Input, Textarea)
- Add ActionTypeKeys type to satisfy ESLint
- Fix all build errors for Vercel deployment

All tests passing, ready for production! ✅"

echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Done! Check Vercel deployment:"
echo "https://vercel.com/agds-alt/loss-tracker-mvp"
echo ""

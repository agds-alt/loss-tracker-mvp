#!/bin/bash

# Deploy Loss Tracker MVP to GitHub
# Run this script: bash deploy-to-github.sh

set -e  # Exit on error

echo "🚀 Starting deployment process..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Clean up any staged binance-algo-bot files
echo -e "${BLUE}[1/7]${NC} Cleaning up unwanted files..."
git reset HEAD . 2>/dev/null || true
git checkout -- Downloads/ 2>/dev/null || true
rm -rf binance-algo-bot 2>/dev/null || true
echo -e "${GREEN}✓${NC} Cleanup done"
echo ""

# 2. Add git remote
echo -e "${BLUE}[2/7]${NC} Setting up GitHub remote..."
git remote add origin git@github.com:agds-alt/loss-tracker-mvp.git 2>/dev/null || \
git remote set-url origin git@github.com:agds-alt/loss-tracker-mvp.git
echo -e "${GREEN}✓${NC} Remote configured"
echo ""

# 3. Stage relevant files only
echo -e "${BLUE}[3/7]${NC} Staging project files..."
git add .
echo -e "${GREEN}✓${NC} Files staged"
echo ""

# 4. Show what will be committed
echo -e "${BLUE}[4/7]${NC} Files to be committed:"
git status --short
echo ""

# 5. Commit with detailed message
echo -e "${BLUE}[5/7]${NC} Creating commit..."
git commit -m "feat: Complete Phase 1 - Loss Tracker MVP with WIN/LOSS tracking

Features:
- ✅ Full authentication system with commitment checkbox
- ✅ Dashboard with hero stats, quick actions, and charts
- ✅ WIN/LOSS tracking (Deposits vs Withdrawals)
- ✅ NET profit/loss calculation (fair tracking!)
- ✅ Visual indicators (green for wins, red for losses)
- ✅ Entry list with edit/delete functionality
- ✅ Reality check calculator with NET loss
- ✅ Week summary chart (deposits vs withdrawals)
- ✅ Responsive design with Tailwind CSS
- ✅ Real-time stats updates via Supabase triggers

Tech Stack:
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Supabase (Auth + PostgreSQL)
- Shadcn/ui components
- Recharts for visualization
- Zod validation

Ready for production deployment! 🚀

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
echo -e "${GREEN}✓${NC} Commit created"
echo ""

# 6. Rename branch to main
echo -e "${BLUE}[6/7]${NC} Renaming branch to main..."
git branch -M main
echo -e "${GREEN}✓${NC} Branch renamed"
echo ""

# 7. Push to GitHub
echo -e "${BLUE}[7/7]${NC} Pushing to GitHub..."
git push -u origin main
echo -e "${GREEN}✓${NC} Pushed to GitHub!"
echo ""

echo -e "${GREEN}🎉 SUCCESS!${NC}"
echo ""
echo "Repository URL: https://github.com/agds-alt/loss-tracker-mvp"
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com/new"
echo "2. Import: agds-alt/loss-tracker-mvp"
echo "3. Add environment variables:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "4. Click Deploy!"
echo ""

# Loss Tracker MVP

A full-stack web application built with Next.js 14, TypeScript, and Supabase to help track gambling (judol) and crypto losses, visualize spending patterns, and build better financial habits.

## Features

### Authentication
- ✅ Sign up with email validation
- ✅ Strong password requirements (min 8 chars, 1 uppercase, 1 number)
- ✅ Unique username validation
- ✅ Login with remember me
- ✅ Protected routes with middleware
- ✅ Commitment checkbox: "Saya berkomitmen untuk tobat dari judol"

### Dashboard
- ✅ **Hero Stats Cards**
  - Total Judol Loss (red theme)
  - Total Crypto Loss (orange theme)
  - Clean Days Streak (green theme)

- ✅ **Quick Actions**
  - Add Judol Loss (modal)
  - Add Crypto Loss (modal)
  - View Full Report button

- ✅ **Week Summary Chart**
  - Bar chart comparing judol vs crypto losses (last 7 days)
  - Built with Recharts
  - Hover tooltips with exact amounts

- ✅ **Motivation Section**
  - Daily rotating motivational quotes
  - Days since last judol counter
  - Progress visualization

### My Tracker Page
- ✅ **Input Form (Sticky)**
  - Type selector (Judol/Crypto)
  - Site/Coin name input with autocomplete
  - Amount input (Rupiah)
  - Date picker
  - Optional notes textarea
  - Full Zod validation

- ✅ **Entry List Table**
  - Sortable columns
  - Color-coded rows (Judol = red tint, Crypto = orange tint)
  - Edit & Delete actions with confirmation
  - Pagination (20 items per page)
  - Search by site/coin name
  - Filter by type (All/Judol/Crypto)

- ✅ **Reality Check Calculator**
  - "Uang ini bisa DCA Bitcoin X bulan"
  - "Setara X gram emas"
  - "X% dari UMR Jakarta"
  - "Bisa bayar kos X bulan"
  - Judol vs Crypto comparison alert

- ✅ **Summary Stats**
  - Total entries count
  - Average loss per entry
  - Biggest single loss with details

## Tech Stack

### Frontend
- **Next.js 14** - App Router with Server Components
- **TypeScript** - Strict mode
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Beautiful UI components
- **Recharts** - Interactive charts
- **Zod** - Schema validation
- **date-fns** - Date formatting

### Backend
- **Supabase** - Authentication & PostgreSQL database
- **Row Level Security (RLS)** - Data protection
- **Real-time subscriptions** - Live updates

## Database Schema

### Tables

#### `users`
```sql
- id (uuid, primary key, references auth.users)
- email (text, unique)
- username (text, unique)
- created_at (timestamp)
- avatar_url (text, nullable)
```

#### `losses`
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key -> users.id)
- type (enum: 'judol' | 'crypto')
- site_coin_name (text)
- amount (numeric)
- date (date)
- notes (text, nullable)
- created_at (timestamp)
```

#### `user_stats`
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key, unique)
- last_judol_date (date, nullable)
- clean_days (integer, default 0)
- total_judol_loss (numeric, default 0)
- total_crypto_loss (numeric, default 0)
- updated_at (timestamp)
```

### Automatic Features
- Auto-create user profile on signup
- Auto-update stats on loss add/edit/delete
- Auto-calculate clean days
- Triggers for data consistency

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Supabase account (free tier works)

### 1. Clone & Install Dependencies

```bash
cd /path/to/loss-tracker-mvp
pnpm install
```

### 2. Setup Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be ready (2-3 minutes)
3. Copy your project URL and anon key from Settings > API

### 3. Run Database Migration

1. In Supabase Dashboard, go to SQL Editor
2. Create a new query
3. Copy the entire content of `supabase-migration.sql`
4. Paste and run the SQL
5. Verify all tables are created in Table Editor

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create Your First Account

1. Click "Sign up sekarang"
2. Fill in email, username, password
3. Check "Saya berkomitmen untuk tobat dari judol"
4. Click "Create Account"
5. You'll be redirected to the dashboard!

## Project Structure

```
loss-tracker-mvp/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   ├── signup/         # Signup page
│   │   └── forgot-password/
│   ├── (dashboard)/
│   │   ├── dashboard/      # Main dashboard
│   │   ├── tracker/        # My Tracker page
│   │   ├── settings/       # Settings page
│   │   └── layout.tsx      # Dashboard layout with sidebar
│   ├── api/losses/         # API routes (optional)
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home (redirects)
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # Shadcn/ui components
│   ├── dashboard/          # Dashboard components
│   ├── tracker/            # Tracker components
│   └── auth/               # Auth components
├── lib/
│   ├── supabase/           # Supabase clients
│   └── utils.ts            # Utility functions
├── types/
│   └── database.types.ts   # Database types
├── middleware.ts           # Auth middleware
├── supabase-migration.sql  # Database schema
└── README.md               # This file
```

## Key Features Implementation

### Real-time Updates
User stats automatically update when you add/edit/delete losses thanks to Supabase triggers.

### Security
- Row Level Security (RLS) ensures users can only access their own data
- Password hashing by Supabase Auth
- Protected API routes
- Middleware guards for authenticated pages

### Responsive Design
- Mobile-first approach
- Breakpoints: mobile (<640px), tablet (640-1024px), desktop (>1024px)
- Sticky input form on tracker page
- Responsive charts and tables

### Form Validation
All forms use Zod schemas with:
- Email format validation
- Password strength requirements
- Username uniqueness
- Required field checks
- Number range validation

## Customization

### Motivational Quotes
Edit `lib/utils.ts` > `getMotivationalQuote()` to add/modify quotes.

### Reality Check Calculations
Edit `components/tracker/reality-check.tsx` to customize:
- DCA amount (default: 1M/month)
- Gold price (default: 1.2M/gram)
- UMR Jakarta (default: 5M/month)
- Kos price (default: 1.5M/month)

### Color Scheme
Edit `tailwind.config.ts` to change:
- `judol` theme (default: red #ef4444)
- `crypto` theme (default: orange #f97316)
- `clean` theme (default: green #22c55e)

## Troubleshooting

### "Relation does not exist" Error
Make sure you've run the `supabase-migration.sql` in Supabase SQL Editor.

### Auth Not Working
1. Check `.env.local` has correct Supabase URL and key
2. Verify Supabase project is not paused
3. Check browser console for errors

### Stats Not Updating
1. Check Supabase triggers are created (in Database > Triggers)
2. Verify RLS policies are enabled
3. Try refreshing the page

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
pnpm install
pnpm build
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables (same as `.env.local`)
5. Deploy!

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your-production-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-key
```

## Future Enhancements (Phase 2)

- [ ] Leaderboard (community feature)
- [ ] Community forum
- [ ] Export data as CSV
- [ ] Print-friendly reports
- [ ] Dark mode toggle
- [ ] Google OAuth login
- [ ] Email notifications
- [ ] Achievement badges
- [ ] Mobile app (React Native)

## License

MIT License - feel free to use this for your own projects!

## Credits

Built with ❤️ using:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)

---

**Remember**: The first step to financial freedom is awareness. Track your losses, learn from them, and build better habits! 🎯💰

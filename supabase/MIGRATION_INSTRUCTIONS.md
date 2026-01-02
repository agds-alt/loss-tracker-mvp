# Phase 2 Migration Instructions

## Apply Database Migration

### Option 1: Supabase Dashboard (Recommended for now)

1. Go to https://tmxkdwwdiftcldhsxubd.supabase.co/project/tmxkdwwdiftcldhsxubd/editor
2. Click on "SQL Editor" in the left sidebar
3. Create a new query
4. Copy the entire contents of `supabase/migrations/20260102_phase2_tables.sql`
5. Paste into the SQL editor
6. Click "Run" to execute

###Option 2: Supabase CLI (Future)

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref tmxkdwwdiftcldhsxubd

# Apply migration
supabase db push
```

## Verify Migration

After running the migration, verify the tables were created:

```sql
-- Check all new tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'leaderboard_cache',
  'posts',
  'post_reactions',
  'comments',
  'comment_likes',
  'notifications',
  'user_badges',
  'reports',
  'user_privacy_settings'
);
```

## Tables Created

1. **leaderboard_cache** - Cached rankings for performance
2. **posts** - Community posts
3. **post_reactions** - Reactions to posts (support, love, congrats)
4. **comments** - Comments on posts with nesting support
5. **comment_likes** - Likes on comments
6. **notifications** - User notifications
7. **user_badges** - Achievement badges
8. **reports** - Content moderation reports
9. **user_privacy_settings** - User privacy preferences

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:
- Public read access for community content
- Users can only modify their own data
- Notifications are private to each user

## Next Steps

1. Apply the migration using Option 1 above
2. Verify all tables were created
3. Test that RLS policies work correctly
4. Start building the frontend pages

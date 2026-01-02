-- Phase 2: Leaderboard & Community Tables
-- Created: 2026-01-02

-- ============================================
-- LEADERBOARD CACHE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.leaderboard_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('clean_days', 'turnaround', 'improved')),
    rank INTEGER NOT NULL,
    stats_json JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category)
);

CREATE INDEX idx_leaderboard_category_rank ON public.leaderboard_cache(category, rank);
CREATE INDEX idx_leaderboard_user ON public.leaderboard_cache(user_id);

-- ============================================
-- POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('story', 'milestone', 'support', 'tips')),
    content TEXT NOT NULL,
    image_url TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    hashtags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_posts_user ON public.posts(user_id);
CREATE INDEX idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX idx_posts_type ON public.posts(type);
CREATE INDEX idx_posts_hashtags ON public.posts USING GIN(hashtags);

-- ============================================
-- POST REACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.post_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('support', 'love', 'congrats')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE INDEX idx_reactions_post ON public.post_reactions(post_id);
CREATE INDEX idx_reactions_user ON public.post_reactions(user_id);

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) <= 300),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON public.comments(post_id);
CREATE INDEX idx_comments_user ON public.comments(user_id);
CREATE INDEX idx_comments_parent ON public.comments(parent_comment_id);

-- ============================================
-- COMMENT LIKES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

CREATE INDEX idx_comment_likes_comment ON public.comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user ON public.comment_likes(user_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('comment', 'reaction', 'rank_up', 'milestone', 'encouragement', 'summary')),
    content TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- ============================================
-- USER BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL CHECK (badge_type IN ('fire_streak', 'champion', 'diamond_hands', 'comeback_king', 'rising_star', 'on_track')),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_type)
);

CREATE INDEX idx_badges_user ON public.user_badges(user_id);

-- ============================================
-- REPORTS TABLE (for moderation)
-- ============================================
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL)
);

CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_created ON public.reports(created_at DESC);

-- ============================================
-- USER PRIVACY SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_privacy_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    public_profile BOOLEAN DEFAULT true,
    show_stats_in_leaderboard BOOLEAN DEFAULT true,
    allow_activity_view BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    in_app_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_privacy_user ON public.user_privacy_settings(user_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.leaderboard_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_privacy_settings ENABLE ROW LEVEL SECURITY;

-- Leaderboard Cache Policies
CREATE POLICY "Leaderboard is viewable by everyone" ON public.leaderboard_cache
    FOR SELECT USING (true);

-- Posts Policies
CREATE POLICY "Posts are viewable by everyone" ON public.posts
    FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = user_id OR is_anonymous = true);

CREATE POLICY "Users can update own posts" ON public.posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.posts
    FOR DELETE USING (auth.uid() = user_id);

-- Post Reactions Policies
CREATE POLICY "Reactions are viewable by everyone" ON public.post_reactions
    FOR SELECT USING (true);

CREATE POLICY "Users can add reactions" ON public.post_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions" ON public.post_reactions
    FOR DELETE USING (auth.uid() = user_id);

-- Comments Policies
CREATE POLICY "Comments are viewable by everyone" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.comments
    FOR DELETE USING (auth.uid() = user_id);

-- Comment Likes Policies
CREATE POLICY "Comment likes are viewable by everyone" ON public.comment_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like comments" ON public.comment_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own likes" ON public.comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- User Badges Policies
CREATE POLICY "Badges are viewable by everyone" ON public.user_badges
    FOR SELECT USING (true);

-- Reports Policies
CREATE POLICY "Users can view own reports" ON public.reports
    FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Privacy Settings Policies
CREATE POLICY "Users can view own privacy settings" ON public.user_privacy_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own privacy settings" ON public.user_privacy_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own privacy settings" ON public.user_privacy_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_privacy_settings_updated_at BEFORE UPDATE ON public.user_privacy_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create default privacy settings for new users
CREATE OR REPLACE FUNCTION create_default_privacy_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_privacy_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create privacy settings on user creation
CREATE TRIGGER create_user_privacy_settings
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_default_privacy_settings();

-- ============================================
-- INITIAL DATA / SEED
-- ============================================

-- Create some initial badge definitions (optional)
-- These can be queried by the app to show available badges

COMMENT ON TABLE public.leaderboard_cache IS 'Cached leaderboard rankings updated hourly';
COMMENT ON TABLE public.posts IS 'User posts in community feed';
COMMENT ON TABLE public.post_reactions IS 'Reactions (support, love, congrats) to posts';
COMMENT ON TABLE public.comments IS 'Comments on posts with optional nesting';
COMMENT ON TABLE public.comment_likes IS 'Likes on comments';
COMMENT ON TABLE public.notifications IS 'User notifications for various events';
COMMENT ON TABLE public.user_badges IS 'Badges earned by users for achievements';
COMMENT ON TABLE public.reports IS 'User reports for moderation';
COMMENT ON TABLE public.user_privacy_settings IS 'User privacy and notification preferences';

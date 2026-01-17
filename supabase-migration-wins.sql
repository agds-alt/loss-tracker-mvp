-- Migration for Win/Withdrawal Tracking System
-- Adds ability to track wins and withdrawals from multiple sites
-- Implements leaderboard ranking based on total withdrawals

-- Create wins table (for tracking withdrawals/wins from various sites)
CREATE TABLE IF NOT EXISTS wins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  site_name TEXT NOT NULL, -- e.g., "Stake.com", "BC.Game", "Binance", etc.
  amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'USD' NOT NULL, -- USD, BTC, ETH, etc.
  usd_equivalent NUMERIC(15, 2) NOT NULL CHECK (usd_equivalent >= 0), -- For ranking purposes
  withdrawal_date DATE NOT NULL,
  status TEXT DEFAULT 'completed' NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  proof_url TEXT, -- Optional screenshot/proof
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create win_stats table (aggregate stats for each user)
CREATE TABLE IF NOT EXISTS win_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  total_wins INTEGER DEFAULT 0 NOT NULL,
  total_withdrawal_amount NUMERIC(15, 2) DEFAULT 0 NOT NULL, -- in USD
  highest_withdrawal NUMERIC(15, 2) DEFAULT 0 NOT NULL,
  favorite_site TEXT,
  last_withdrawal_date DATE,
  withdrawal_rank INTEGER, -- Global rank based on total withdrawals
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create sites table (predefined list of popular sites)
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('casino', 'crypto', 'faucet', 'survey', 'airdrop', 'other')),
  icon_emoji TEXT,
  url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert popular sites
INSERT INTO sites (name, category, icon_emoji, url) VALUES
  ('Stake.com', 'casino', '🎰', 'https://stake.com'),
  ('Rollbit', 'casino', '🎲', 'https://rollbit.com'),
  ('Shuffle', 'casino', '🃏', 'https://shuffle.com'),
  ('BC.Game', 'casino', '🎮', 'https://bc.game'),
  ('Binance', 'crypto', '₿', 'https://binance.com'),
  ('Coinbase', 'crypto', '💰', 'https://coinbase.com'),
  ('Kraken', 'crypto', '🐙', 'https://kraken.com'),
  ('FreeBitcoin', 'faucet', '🪙', 'https://freebitco.in'),
  ('Cointiply', 'faucet', '💧', 'https://cointiply.com'),
  ('Swagbucks', 'survey', '📝', 'https://swagbucks.com'),
  ('Other', 'other', '➕', NULL)
ON CONFLICT (name) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wins_user_id ON wins(user_id);
CREATE INDEX IF NOT EXISTS idx_wins_date ON wins(withdrawal_date DESC);
CREATE INDEX IF NOT EXISTS idx_wins_site ON wins(site_name);
CREATE INDEX IF NOT EXISTS idx_wins_status ON wins(status);
CREATE INDEX IF NOT EXISTS idx_win_stats_user_id ON win_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_win_stats_rank ON win_stats(withdrawal_rank);

-- Enable RLS
ALTER TABLE wins ENABLE ROW LEVEL SECURITY;
ALTER TABLE win_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wins table
CREATE POLICY "Users can view own wins"
  ON wins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wins"
  ON wins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wins"
  ON wins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wins"
  ON wins FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for win_stats (everyone can view for leaderboard)
CREATE POLICY "Everyone can view win stats"
  ON win_stats FOR SELECT
  USING (true);

CREATE POLICY "Users can update own win stats"
  ON win_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own win stats"
  ON win_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for sites
CREATE POLICY "Everyone can view sites"
  ON sites FOR SELECT
  USING (true);

-- Function to update win_stats when win is added/updated/deleted
CREATE OR REPLACE FUNCTION update_win_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_total_wins INTEGER;
  v_total_amount NUMERIC;
  v_highest NUMERIC;
  v_favorite_site TEXT;
  v_last_date DATE;
BEGIN
  -- Calculate stats
  SELECT
    COUNT(*)::INTEGER,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN usd_equivalent ELSE 0 END), 0),
    COALESCE(MAX(CASE WHEN status = 'completed' THEN usd_equivalent ELSE 0 END), 0),
    MODE() WITHIN GROUP (ORDER BY site_name),
    MAX(CASE WHEN status = 'completed' THEN withdrawal_date END)
  INTO v_total_wins, v_total_amount, v_highest, v_favorite_site, v_last_date
  FROM wins
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND status = 'completed';

  -- Upsert win_stats
  INSERT INTO win_stats (user_id, total_wins, total_withdrawal_amount, highest_withdrawal, favorite_site, last_withdrawal_date, updated_at)
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    v_total_wins,
    v_total_amount,
    v_highest,
    v_favorite_site,
    v_last_date,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_wins = v_total_wins,
    total_withdrawal_amount = v_total_amount,
    highest_withdrawal = v_highest,
    favorite_site = v_favorite_site,
    last_withdrawal_date = v_last_date,
    updated_at = NOW();

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update win_stats
CREATE TRIGGER on_win_change
  AFTER INSERT OR UPDATE OR DELETE ON wins
  FOR EACH ROW EXECUTE FUNCTION update_win_stats();

-- Function to update withdrawal rankings (call this periodically or after stat changes)
CREATE OR REPLACE FUNCTION update_withdrawal_rankings()
RETURNS void AS $$
BEGIN
  WITH ranked_users AS (
    SELECT
      user_id,
      ROW_NUMBER() OVER (ORDER BY total_withdrawal_amount DESC, total_wins DESC) as rank
    FROM win_stats
    WHERE total_withdrawal_amount > 0
  )
  UPDATE win_stats ws
  SET withdrawal_rank = ru.rank
  FROM ranked_users ru
  WHERE ws.user_id = ru.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initial win_stats for existing users
INSERT INTO win_stats (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;

-- Update rankings
SELECT update_withdrawal_rankings();

-- Create view for leaderboard
CREATE OR REPLACE VIEW leaderboard_withdrawals AS
SELECT
  ws.withdrawal_rank as rank,
  u.username,
  u.avatar_url,
  ws.total_wins,
  ws.total_withdrawal_amount,
  ws.highest_withdrawal,
  ws.favorite_site,
  ws.last_withdrawal_date,
  u.id as user_id
FROM win_stats ws
JOIN users u ON ws.user_id = u.id
WHERE ws.total_withdrawal_amount > 0
ORDER BY ws.withdrawal_rank ASC
LIMIT 100;

-- Grant access to view
GRANT SELECT ON leaderboard_withdrawals TO authenticated;

COMMENT ON TABLE wins IS 'Tracks all wins/withdrawals from various gambling and crypto sites';
COMMENT ON TABLE win_stats IS 'Aggregate statistics for user withdrawals, used for leaderboard ranking';
COMMENT ON TABLE sites IS 'List of supported sites for tracking';
COMMENT ON VIEW leaderboard_withdrawals IS 'Top 100 users ranked by total withdrawal amount';

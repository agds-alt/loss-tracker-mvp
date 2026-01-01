-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create loss_type enum
CREATE TYPE loss_type AS ENUM ('judol', 'crypto');

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  avatar_url TEXT
);

-- Create losses table
CREATE TABLE losses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type loss_type NOT NULL,
  site_coin_name TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create user_stats table
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  last_judol_date DATE,
  clean_days INTEGER DEFAULT 0 NOT NULL,
  total_judol_loss NUMERIC(15, 2) DEFAULT 0 NOT NULL,
  total_crypto_loss NUMERIC(15, 2) DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_losses_user_id ON losses(user_id);
CREATE INDEX idx_losses_date ON losses(date DESC);
CREATE INDEX idx_losses_type ON losses(type);
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE losses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for losses table
CREATE POLICY "Users can view own losses"
  ON losses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own losses"
  ON losses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own losses"
  ON losses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own losses"
  ON losses FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_stats table
CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically create user record and stats on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );

  INSERT INTO user_stats (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user and stats on auth signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update user_stats when loss is added/updated/deleted
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_total_judol NUMERIC;
  v_total_crypto NUMERIC;
  v_last_judol_date DATE;
  v_clean_days INTEGER;
BEGIN
  -- Calculate totals
  SELECT
    COALESCE(SUM(CASE WHEN type = 'judol' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'crypto' THEN amount ELSE 0 END), 0),
    MAX(CASE WHEN type = 'judol' THEN date END)
  INTO v_total_judol, v_total_crypto, v_last_judol_date
  FROM losses
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);

  -- Calculate clean days
  IF v_last_judol_date IS NOT NULL THEN
    v_clean_days := EXTRACT(DAY FROM NOW() - v_last_judol_date)::INTEGER;
  ELSE
    v_clean_days := 0;
  END IF;

  -- Update user_stats
  UPDATE user_stats
  SET
    total_judol_loss = v_total_judol,
    total_crypto_loss = v_total_crypto,
    last_judol_date = v_last_judol_date,
    clean_days = v_clean_days,
    updated_at = NOW()
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to update stats
CREATE TRIGGER on_loss_insert
  AFTER INSERT ON losses
  FOR EACH ROW EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER on_loss_update
  AFTER UPDATE ON losses
  FOR EACH ROW EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER on_loss_delete
  AFTER DELETE ON losses
  FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- Enable realtime for user_stats (for live dashboard updates)
ALTER PUBLICATION supabase_realtime ADD TABLE user_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE losses;

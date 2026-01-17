-- Migration: Add Win/Loss Tracking
-- Run this in Supabase SQL Editor

-- Step 1: Add is_win column to losses table
ALTER TABLE losses
ADD COLUMN IF NOT EXISTS is_win BOOLEAN DEFAULT FALSE;

-- Step 2: Add comment for clarity
COMMENT ON COLUMN losses.is_win IS 'TRUE = Win/Withdrawal, FALSE = Loss/Deposit';

-- Step 3: Update user_stats to include win columns
ALTER TABLE user_stats
ADD COLUMN IF NOT EXISTS total_casino_win NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_crypto_win NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_casino NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_crypto NUMERIC(15, 2) DEFAULT 0;

-- Step 4: Update the update_user_stats function to calculate wins/losses
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_total_casino_loss NUMERIC;
  v_total_crypto_loss NUMERIC;
  v_total_casino_win NUMERIC;
  v_total_crypto_win NUMERIC;
  v_last_casino_date DATE;
  v_clean_days INTEGER;
BEGIN
  -- Calculate totals
  SELECT
    COALESCE(SUM(CASE WHEN type = 'casino' AND is_win = FALSE THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'crypto' AND is_win = FALSE THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'casino' AND is_win = TRUE THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'crypto' AND is_win = TRUE THEN amount ELSE 0 END), 0),
    MAX(CASE WHEN type = 'casino' AND is_win = FALSE THEN date END)
  INTO v_total_casino_loss, v_total_crypto_loss, v_total_casino_win, v_total_crypto_win, v_last_casino_date
  FROM losses
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);

  -- Calculate clean days (days since last casino LOSS)
  IF v_last_casino_date IS NOT NULL THEN
    v_clean_days := EXTRACT(DAY FROM NOW() - v_last_casino_date)::INTEGER;
  ELSE
    v_clean_days := 0;
  END IF;

  -- Update user_stats
  UPDATE user_stats
  SET
    total_casino_loss = v_total_casino_loss,
    total_crypto_loss = v_total_crypto_loss,
    total_casino_win = v_total_casino_win,
    total_crypto_win = v_total_crypto_win,
    net_casino = v_total_casino_win - v_total_casino_loss,
    net_crypto = v_total_crypto_win - v_total_crypto_loss,
    last_casino_date = v_last_casino_date,
    clean_days = v_clean_days,
    updated_at = NOW()
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Update existing data (set all current entries as losses by default)
UPDATE losses SET is_win = FALSE WHERE is_win IS NULL;

-- Step 6: Recalculate stats for all users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT DISTINCT user_id FROM losses LOOP
    -- Trigger update by touching a loss record
    UPDATE losses
    SET updated_at = NOW()
    WHERE user_id = user_record.user_id
    LIMIT 1;
  END LOOP;
END $$;

-- Migration complete!
-- Check results:
SELECT
  id,
  email,
  total_casino_loss,
  total_casino_win,
  net_casino,
  total_crypto_loss,
  total_crypto_win,
  net_crypto
FROM users u
JOIN user_stats us ON u.id = us.user_id
ORDER BY u.created_at DESC;

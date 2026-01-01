-- Migration: Add Win/Loss Tracking (FIXED)
-- Run this in Supabase SQL Editor

-- Step 1: Add is_win column to losses table
ALTER TABLE losses
ADD COLUMN IF NOT EXISTS is_win BOOLEAN DEFAULT FALSE;

-- Step 2: Add comment for clarity
COMMENT ON COLUMN losses.is_win IS 'TRUE = Win/Withdrawal, FALSE = Loss/Deposit';

-- Step 3: Update user_stats to include win columns
ALTER TABLE user_stats
ADD COLUMN IF NOT EXISTS total_judol_win NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_crypto_win NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_judol NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_crypto NUMERIC(15, 2) DEFAULT 0;

-- Step 4: Update existing data (set all current entries as losses by default)
UPDATE losses SET is_win = FALSE WHERE is_win IS NULL;

-- Step 5: Update the update_user_stats function to calculate wins/losses
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_total_judol_loss NUMERIC;
  v_total_crypto_loss NUMERIC;
  v_total_judol_win NUMERIC;
  v_total_crypto_win NUMERIC;
  v_last_judol_date DATE;
  v_clean_days INTEGER;
BEGIN
  -- Calculate totals
  SELECT
    COALESCE(SUM(CASE WHEN type = 'judol' AND is_win = FALSE THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'crypto' AND is_win = FALSE THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'judol' AND is_win = TRUE THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'crypto' AND is_win = TRUE THEN amount ELSE 0 END), 0),
    MAX(CASE WHEN type = 'judol' AND is_win = FALSE THEN date END)
  INTO v_total_judol_loss, v_total_crypto_loss, v_total_judol_win, v_total_crypto_win, v_last_judol_date
  FROM losses
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);

  -- Calculate clean days (days since last judol LOSS)
  IF v_last_judol_date IS NOT NULL THEN
    v_clean_days := EXTRACT(DAY FROM NOW() - v_last_judol_date)::INTEGER;
  ELSE
    v_clean_days := 0;
  END IF;

  -- Update user_stats
  UPDATE user_stats
  SET
    total_judol_loss = v_total_judol_loss,
    total_crypto_loss = v_total_crypto_loss,
    total_judol_win = v_total_judol_win,
    total_crypto_win = v_total_crypto_win,
    net_judol = v_total_judol_win - v_total_judol_loss,
    net_crypto = v_total_crypto_win - v_total_crypto_loss,
    last_judol_date = v_last_judol_date,
    clean_days = v_clean_days,
    updated_at = NOW()
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Recalculate stats for all existing users
DO $$
DECLARE
  user_record RECORD;
  loss_id UUID;
BEGIN
  FOR user_record IN SELECT DISTINCT user_id FROM losses LOOP
    -- Get one loss ID for this user
    SELECT id INTO loss_id
    FROM losses
    WHERE user_id = user_record.user_id
    ORDER BY created_at DESC
    FETCH FIRST 1 ROW ONLY;

    -- Trigger update by touching that loss record
    IF loss_id IS NOT NULL THEN
      UPDATE losses
      SET amount = amount
      WHERE id = loss_id;
    END IF;
  END LOOP;
END $$;

-- Migration complete! Verify results:
SELECT
  u.email,
  us.total_judol_loss,
  us.total_judol_win,
  us.net_judol,
  us.total_crypto_loss,
  us.total_crypto_win,
  us.net_crypto
FROM users u
JOIN user_stats us ON u.id = us.user_id
ORDER BY u.created_at DESC;

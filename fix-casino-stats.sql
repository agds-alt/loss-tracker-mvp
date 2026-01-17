-- Fix Casino Stats Migration
-- Run this in Supabase SQL Editor to add missing columns and fix stats calculation

-- Step 1: Add missing columns to user_stats if they don't exist
ALTER TABLE user_stats
ADD COLUMN IF NOT EXISTS total_casino_win NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_crypto_win NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_casino NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_crypto NUMERIC(15, 2) DEFAULT 0;

-- Step 2: Add is_win column to losses table if it doesn't exist
ALTER TABLE losses
ADD COLUMN IF NOT EXISTS is_win BOOLEAN DEFAULT FALSE;

-- Step 3: Add comment for clarity
COMMENT ON COLUMN losses.is_win IS 'TRUE = Win/Withdrawal, FALSE = Loss/Deposit';

-- Step 4: Update existing data (set all entries without is_win as losses)
UPDATE losses SET is_win = FALSE WHERE is_win IS NULL;

-- Step 5: Create or replace the trigger function with correct casino type
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
  -- Calculate totals with 'casino' type (not 'judol')
  SELECT
    COALESCE(SUM(CASE WHEN type = 'casino' AND is_win = FALSE THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'crypto' AND is_win = FALSE THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'casino' AND is_win = TRUE THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'crypto' AND is_win = TRUE THEN amount ELSE 0 END), 0),
    MAX(CASE WHEN type = 'casino' AND is_win = FALSE THEN date END)
  INTO v_total_casino_loss, v_total_crypto_loss, v_total_casino_win, v_total_crypto_win, v_last_casino_date
  FROM losses
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);

  -- Calculate clean days (days since last casino LOSS, not win)
  IF v_last_casino_date IS NOT NULL THEN
    v_clean_days := EXTRACT(DAY FROM NOW() - v_last_casino_date)::INTEGER;
  ELSE
    v_clean_days := 0;
  END IF;

  -- Update or insert user_stats
  INSERT INTO user_stats (
    user_id,
    total_casino_loss,
    total_crypto_loss,
    total_casino_win,
    total_crypto_win,
    net_casino,
    net_crypto,
    last_casino_date,
    clean_days,
    updated_at
  )
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    v_total_casino_loss,
    v_total_crypto_loss,
    v_total_casino_win,
    v_total_crypto_win,
    v_total_casino_win - v_total_casino_loss,
    v_total_crypto_win - v_total_crypto_loss,
    v_last_casino_date,
    v_clean_days,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_casino_loss = v_total_casino_loss,
    total_crypto_loss = v_total_crypto_loss,
    total_casino_win = v_total_casino_win,
    total_crypto_win = v_total_crypto_win,
    net_casino = v_total_casino_win - v_total_casino_loss,
    net_crypto = v_total_crypto_win - v_total_crypto_loss,
    last_casino_date = v_last_casino_date,
    clean_days = v_clean_days,
    updated_at = NOW();

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Recreate trigger
DROP TRIGGER IF EXISTS update_user_stats_trigger ON losses;
CREATE TRIGGER update_user_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON losses
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

-- Step 7: Recalculate stats for all existing users
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
    LIMIT 1;

    -- Trigger update by touching that loss record
    IF loss_id IS NOT NULL THEN
      UPDATE losses
      SET amount = amount
      WHERE id = loss_id;
    END IF;
  END LOOP;
END $$;

-- Step 8: Verify results
SELECT
  u.email,
  us.total_casino_loss,
  us.total_casino_win,
  us.net_casino,
  us.total_crypto_loss,
  us.total_crypto_win,
  us.net_crypto,
  us.clean_days
FROM users u
LEFT JOIN user_stats us ON u.id = us.user_id
ORDER BY u.created_at DESC
LIMIT 10;

-- Migration complete!
-- You should now see casino win/loss data in the dashboard

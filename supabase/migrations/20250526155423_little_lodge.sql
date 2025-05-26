/*
  # Add theme to user settings

  1. Changes
    - Add theme field to user_settings table with default value 'system'
    - Update existing rows to include theme field
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'user_settings' 
    AND column_name = 'theme'
  ) THEN
    ALTER TABLE user_settings 
    ALTER COLUMN settings SET DEFAULT '{"theme": "system", "quality": "auto", "autoplay": true}'::jsonb;
    
    -- Update existing rows
    UPDATE user_settings 
    SET settings = settings || '{"theme": "system"}'::jsonb 
    WHERE NOT (settings ? 'theme');
  END IF;
END $$;
-- Drop existing triggers first
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop the table
DROP TABLE IF EXISTS settings;

-- Now recreate everything
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create settings table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL DEFAULT 'URL Monitor',
  description TEXT NOT NULL DEFAULT 'Monitor your website uptime and performance',
  logo_url TEXT NOT NULL DEFAULT '/default-logo.png',
  company_name TEXT NOT NULL DEFAULT 'MegaVault',
  contact_email TEXT NOT NULL DEFAULT 'support@megavault.in',
  alert_email TEXT NOT NULL DEFAULT 'alerts@megavault.in',
  alert_threshold INTEGER NOT NULL DEFAULT 90,
  show_watermark BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recreate the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate the trigger
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO settings (
  title, 
  description, 
  logo_url, 
  company_name, 
  contact_email, 
  alert_email, 
  alert_threshold, 
  show_watermark
)
VALUES (
  'URL Monitor',
  'Monitor your website uptime and performance',
  '/default-logo.png',
  'MegaVault',
  'support@megavault.in',
  'alerts@megavault.in',
  90,
  true
);
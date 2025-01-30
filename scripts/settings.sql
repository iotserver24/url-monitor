-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone to IST
SET timezone = 'Asia/Kolkata';

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL DEFAULT 'URL Monitor',
  description TEXT NOT NULL DEFAULT 'Monitor your website uptime and performance',
  logo_url TEXT NOT NULL DEFAULT '/default-logo.png',
  company_name TEXT NOT NULL DEFAULT 'MegaVault',
  contact_email TEXT NOT NULL DEFAULT 'support@megavault.in',
  alert_email TEXT NOT NULL DEFAULT 'alerts@megavault.in',
  alert_threshold INTEGER NOT NULL DEFAULT 90,
  show_watermark BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata'),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata')
);

-- Add trigger for updated_at that uses IST
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = (NOW() AT TIME ZONE 'Asia/Kolkata');
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings if table is empty
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
SELECT 
  'URL Monitor',
  'Monitor your website uptime and performance',
  '/default-logo.png',
  'MegaVault',
  'support@megavault.in',
  'alerts@megavault.in',
  90,
  true
WHERE NOT EXISTS (SELECT 1 FROM settings); 
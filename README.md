# URL Monitor Pro

A professional website monitoring system built with Next.js and Supabase. Monitors uptime, response time, and sends instant alerts for any downtime.

## Core Features

- ⚡ Real-time monitoring (2-minute intervals)
- 📊 Visual uptime graphs & analytics
- ⏱️ Response time tracking
- 📧 Instant downtime alerts
- 🔐 Secure admin panel
- 🌏 IST timezone support
- 📱 Mobile-responsive design
- 📈 90-day log retention
- 🔄 Automated Cloudflare Workers

## Tech Stack

- Frontend: Next.js 15.1.6 + React 19 + TypeScript
- Backend: Supabase (PostgreSQL)
- Worker: Cloudflare Workers
- Email: Brevo SMTP
- UI: Tailwind CSS + Heroicons
- Charts: Chart.js 4
- Toast: react-hot-toast

## Quick Setup

1. Install dependencies:
```bash
git clone https://github.com/iotserver24/url-monitor.git
cd url-monitor
npm install
```

2. Environment setup (.env.local):
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Email (Brevo)
BREVO_USER=your_username
BREVO_KEY=your_api_key

# App
APP_URL=http://localhost:3000
```

3. Cloudflare Worker setup:
```bash
# Copy the example config
cp wrangler.toml.example wrangler.toml

# Edit wrangler.toml with your credentials:
# - Update SUPABASE_URL
# - Update SUPABASE_SERVICE_KEY
# - Update APP_URL for your environment

# Example wrangler.toml structure:
# [vars]
# MONGODB_URI = "your-mongodb-uri"
# SUPABASE_URL = "your-supabase-project-url"
# SUPABASE_SERVICE_KEY = "your-supabase-service-key"
# 
# [env.production]
# vars = { APP_URL = "https://your-production-url" }
# 
# [env.development]
# vars = { APP_URL = "http://localhost:3000" }
```

Note: 
- `wrangler.toml` is gitignored to prevent committing sensitive credentials
- Use `wrangler.toml.example` as a template and rename it to `wrangler.toml`
- Never commit your actual `wrangler.toml` with real credentials
- The worker runs every 2 minutes to check your URLs

## Database Setup (Supabase)

1. Create Tables:
```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'Asia/Kolkata';

-- URLs table
CREATE TABLE IF NOT EXISTS urls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('up', 'down', 'pending')),
  uptime FLOAT DEFAULT 100,
  response_time INTEGER DEFAULT 0,
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  down_since TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logs table with 90-day retention
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url_id UUID REFERENCES urls(id),
  url_name TEXT,
  status TEXT NOT NULL,
  response_time INTEGER,
  status_code INTEGER,
  uptime FLOAT,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT DEFAULT 'URL Monitor',
  description TEXT DEFAULT 'Monitor your website uptime',
  logo_url TEXT DEFAULT '/default-logo.png',
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  alert_email TEXT NOT NULL,
  alert_threshold INTEGER DEFAULT 90,
  show_watermark BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url_id UUID REFERENCES urls(id),
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

2. Set up Log Retention:
```sql
-- Create cleanup function (90 days)
CREATE OR REPLACE FUNCTION clean_old_logs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Clean logs older than 90 days
  DELETE FROM logs
  WHERE timestamp < (NOW() AT TIME ZONE 'Asia/Kolkata') - INTERVAL '90 days';
  
  -- Clean old alerts
  DELETE FROM alerts
  WHERE created_at < (NOW() AT TIME ZONE 'Asia/Kolkata') - INTERVAL '90 days';
END;
$$;

-- Create trigger
CREATE OR REPLACE FUNCTION trigger_clean_old_logs()
RETURNS trigger AS $$
BEGIN
  PERFORM clean_old_logs();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to logs table
DROP TRIGGER IF EXISTS clean_old_logs_trigger ON logs;
CREATE TRIGGER clean_old_logs_trigger
  AFTER INSERT ON logs
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_clean_old_logs();

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
```

3. Insert Default Settings:
```sql
INSERT INTO settings (
  title,
  description,
  company_name,
  contact_email,
  alert_email,
  alert_threshold
) VALUES (
  'URL Monitor',
  'Monitor your website uptime and performance',
  'MegaVault',
  'support@megavault.in',
  'alerts@megavault.in',
  90
) ON CONFLICT DO NOTHING;
```

## Development

1. Start development server:
```bash
npm run dev
```

2. Deploy Cloudflare Worker:
```bash
npm run build:worker
npm run worker:deploy
```

## Monitoring Commands

1. Check Log Retention:
```sql
SELECT 
    MIN(timestamp AT TIME ZONE 'Asia/Kolkata') as oldest_log,
    MAX(timestamp AT TIME ZONE 'Asia/Kolkata') as newest_log,
    COUNT(*) as total_logs,
    (MAX(timestamp) - MIN(timestamp)) as retention_period
FROM logs;
```

2. View Daily Logs:
```sql
SELECT 
    DATE(timestamp AT TIME ZONE 'Asia/Kolkata') as date,
    COUNT(*) as log_count,
    SUM(CASE WHEN status = 'down' THEN 1 ELSE 0 END) as downtime_count
FROM logs
GROUP BY DATE(timestamp AT TIME ZONE 'Asia/Kolkata')
ORDER BY date DESC;
```

3. Check Database Size:
```sql
SELECT 
    pg_size_pretty(pg_total_relation_size('logs')) as logs_size,
    pg_size_pretty(pg_total_relation_size('alerts')) as alerts_size,
    (SELECT COUNT(*) FROM logs) as total_logs,
    (SELECT COUNT(*) FROM alerts) as total_alerts;
```

## Production Deployment

1. Build:
```bash
npm run build
```

2. Deploy Worker:
```bash
npm run worker:deploy
```

## Key Features

- **Real-time Monitoring**: Checks every 2 minutes
- **Smart Alerts**: Triggers when uptime drops below threshold
- **IST Timezone**: All timestamps in Indian Standard Time
- **90-day History**: Automatic log cleanup after 90 days
- **Email Alerts**: Instant notifications via Brevo SMTP
- **Performance**: Optimized database queries and indexes

## Support

- 📧 Email: your-support-email@domain.com
- 🌐 Website: https://your-website.com

## License

MIT License - see [LICENSE](LICENSE)

---
Built with ❤️ by [MegaVault](https://megavault.in)

## Code Documentation

### Core Components

1. **Email Service** (`lib/services/email.ts`):
```typescript
// Email configuration using Brevo SMTP
const transporter = createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_KEY,
  },
})

// Send alert emails with IST timezone
async function sendAlertEmail(url: string, uptime: number, settings: Settings) {
  const timestamp = new Date().toLocaleString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'long'
  })
  
  // HTML email template with status, uptime, and action button
  const html = `...`
  
  return transporter.sendMail({
    from: `"URL Monitor" <${settings.alert_email}>`,
    to: settings.contact_email,
    subject: `🚨 ALERT: ${url} is DOWN`,
    html,
  })
}
```

2. **Monitor Service** (`lib/monitor.ts`):
```typescript
const UPTIME_WEIGHT = 0.01 // 1% per check
const RECHECK_INTERVAL = 2 * 60 * 1000 // 2 minutes
const ALERT_THRESHOLD = 90 // Default threshold

// Check single URL
async function checkUrl(url: string): Promise<{ isUp: boolean; responseTime: number }> {
  const start = Date.now()
  try {
    const response = await fetch(url, { 
      timeout: 30000, // 30s timeout
      headers: { 'User-Agent': 'URL-Monitor/1.0' }
    })
    return { 
      isUp: response.ok, 
      responseTime: Date.now() - start 
    }
  } catch (error) {
    return { 
      isUp: false, 
      responseTime: Date.now() - start 
    }
  }
}

// Update URL status and send alerts if needed
async function updateUrlStatus(url: Url, isUp: boolean, responseTime: number) {
  // Calculate new uptime with weighted average
  const newUptime = url.uptime * (1 - UPTIME_WEIGHT) + (isUp ? 1 : 0) * UPTIME_WEIGHT
  
  // Check threshold and send alert if needed
  const settings = await Settings.findOne()
  if (newUptime < settings.alert_threshold) {
    await sendAlertEmail(url.url, newUptime, settings)
  }
  
  // Update database
  await supabase.from('urls').update({...})
  await supabase.from('logs').insert({...})
}
```

3. **Cloudflare Worker** (`worker.js`):
```typescript
// Runs every 2 minutes
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
    
    // Get active URLs and monitor each
    const { data: urls } = await supabase
      .from('urls')
      .select('*')
      .eq('is_active', true)
      
    for (const url of urls) {
      // Check URL status
      const check = await checkUrl(url.url)
      
      // Update status and logs
      await updateUrlStatus(url, check.ok, check.time)
      
      // Send alerts if needed
      if (!check.ok) {
        await sendAlert(url, env)
      }
    }
  }
}
```

4. **Alert API** (`app/api/alerts/route.ts`):
```typescript
export async function POST(request: Request) {
  // Verify request is from our worker
  const isWorker = request.headers.get('CF-Worker')
  if (!isWorker) return new NextResponse('Unauthorized', { status: 401 })
  
  // Get alert data and settings
  const { url, uptime } = await request.json()
  const settings = await Settings.findOne()
  
  // Send alert email
  await sendAlertEmail(url, uptime, settings)
  
  return NextResponse.json({ success: true })
}
```

### Key Workflows

1. **Monitoring Flow**:
   - Worker runs every 2 minutes
   - Checks each active URL
   - Updates status and uptime
   - Creates log entries
   - Triggers alerts if needed

2. **Alert Flow**:
   - Worker detects downtime
   - Calls alert API endpoint
   - API verifies worker request
   - Sends email via Brevo SMTP
   - Email includes IST timestamp

3. **Uptime Calculation**:
   - Uses weighted rolling average
   - New check = 1% of total
   - Maintains uptime history
   - Triggers alerts below threshold

4. **Log Management**:
   - Creates log entry per check
   - Stores in Supabase
   - 90-day retention
   - Automatic cleanup

## Security Setup

1. Environment Variables:
   - Copy `.env.example` to `.env.local`
   - Never commit `.env` files
   - Set up environment variables in your deployment platform

2. Supabase Setup:
   - Create a new project
   - Use service role key only in secure environments
   - Set up row level security (RLS)

3. Worker Deployment:
   - Set environment secrets in Cloudflare
   - Never commit credentials
   - Use `wrangler secret` commands

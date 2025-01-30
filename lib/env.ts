export function validateEnv() {
  const required = [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
    'MONITOR_SECRET',
    'BREVO_USER',
    'BREVO_KEY',
    'ALERT_FROM_EMAIL',
    'ALERT_TO_EMAIL',
    'APP_URL'
  ]

  for (const var_name of required) {
    if (!process.env[var_name]) {
      throw new Error(`Missing required environment variable: ${var_name}`)
    }
  }
} 
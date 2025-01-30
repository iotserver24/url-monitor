export interface Env {
  // Add your environment variables here
  MONGODB_URI: string;
  MONITOR_SECRET: string;
  APP_URL: string;
}

// Trigger every 5 minutes
export default {
  // Add fetch handler
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return new Response('Worker is running!');
  },

  // Scheduled handler for cron
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // Triggers every 5 minutes as defined in wrangler.toml
    try {
      const response = await fetch(`${env.APP_URL}/api/monitor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.MONITOR_SECRET}`,
          'Content-Type': 'application/json',
          'CF-Worker': 'true',
          'User-Agent': 'Cloudflare-Worker'
        }
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.error(`Response not OK: ${response.status}`, text);
        throw new Error(`HTTP error! status: ${response.status} - ${text}`);
      }
      
      const data = await response.json();
      console.log('Monitoring complete:', new Date().toISOString(), data);
    } catch (error) {
      console.error('Error in worker:', error);
      throw error; // Re-throw to ensure Cloudflare logs the error
    }
  },
}; 
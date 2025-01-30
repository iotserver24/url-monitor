import { createClient } from '@supabase/supabase-js'

export default {
  async fetch(request, env) {
    return new Response("Worker is running!");
  },

  async scheduled(event, env, ctx) {
    try {
      console.log('Worker started at:', new Date().toISOString());
      
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
      
      // Get all URLs
      const { data: urls, error: urlError } = await supabase
        .from('urls')
        .select('*')
      
      if (urlError) throw urlError
      
      for (const url of urls || []) {
        try {
          const response = await fetch(url.url);
          const status = response.ok ? "up" : "down";
          const responseTime = response.headers.get('x-response-time') || '0';

          // Update URL status
          await supabase
            .from('urls')
            .update({
              status,
              uptime: status === "up" ? url.uptime : Math.max(0, url.uptime - 0.01),
              response_time: parseInt(responseTime),
              last_checked: new Date().toISOString()
            })
            .eq('id', url.id)

          // Log the check
          await supabase
            .from('logs')
            .insert({
              url_id: url.id,
              url_name: url.name,
              status,
              response_time: parseInt(responseTime),
              status_code: response.status,
              uptime: url.uptime,
              details: status === "up" ? "OK" : response.statusText
            })

        } catch (error) {
          console.error(`Error checking ${url.name}:`, error);
        }
      }

      console.log('Monitor complete:', new Date().toISOString());
    } catch (error) {
      console.error('Error in worker:', error);
    }
  }
}; 
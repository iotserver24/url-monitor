const cron = require('node-cron');
const { monitorUrls } = require('../lib/monitor.js');
require('dotenv').config({ path: '.env.local' });

// Schedule the monitoring to run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('Running URL monitoring check:', new Date().toISOString());
    await monitorUrls();
    console.log('Monitoring complete');
  } catch (error) {
    console.error('Error during monitoring:', error);
  }
});

console.log('URL monitoring service started. Checking URLs every 5 minutes.');
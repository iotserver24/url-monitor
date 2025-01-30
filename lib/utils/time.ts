export function getISTDateTime() {
  // Create a date in UTC
  const now = new Date()
  
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000 // 5 hours and 30 minutes in milliseconds
  const istTime = new Date(now.getTime() + istOffset)
  
  return istTime.toISOString()
}

export function formatISTDateTime(isoString: string) {
  const date = new Date(isoString)
  return date.toLocaleString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'medium'
  })
} 
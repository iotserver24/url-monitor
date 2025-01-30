const fs = require('fs');
const path = require('path');

const defaultLogoPath = path.join(process.cwd(), 'public', 'default-logo.png');

// Check if default logo exists
if (!fs.existsSync(defaultLogoPath)) {
  // Create public directory if it doesn't exist
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  // Copy default logo from assets
  const sourceLogoPath = path.join(process.cwd(), 'assets', 'default-logo.png');
  if (fs.existsSync(sourceLogoPath)) {
    fs.copyFileSync(sourceLogoPath, defaultLogoPath);
    console.log('Default logo created at:', defaultLogoPath);
  } else {
    // Create an empty file if source doesn't exist
    fs.writeFileSync(defaultLogoPath, '');
    console.log('Empty default logo created at:', defaultLogoPath);
  }
} 
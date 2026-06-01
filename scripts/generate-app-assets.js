#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// SVG templates for different asset types
const createIconSVG = (size, label) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.35}" fill="#ffffff" opacity="0.1"/>
  <text x="${size/2}" y="${size/2+5}" font-size="${Math.floor(size*0.3)}" font-weight="bold" text-anchor="middle" fill="white">${label}</text>
</svg>
`;

const createScreenshotSVG = (width, height, label) => `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect x="20" y="20" width="${width-40}" height="60" rx="8" fill="#0f172a"/>
  <text x="${width/2}" y="60" font-size="24" font-weight="bold" text-anchor="middle" fill="white">Medical Equipment</text>
  <rect x="20" y="100" width="${width-40}" height="${height-120}" rx="8" fill="#ffffff" opacity="0.5"/>
  <text x="${width/2}" y="${height/2}" font-size="28" font-weight="bold" text-anchor="middle" fill="#0f172a">${label}</text>
  <text x="${width/2}" y="${height/2+50}" font-size="14" text-anchor="middle" fill="#64748b">Replacement Planning Tool</text>
</svg>
`;

// Generate icon files (convert SVG to PNG using inline base64)
const iconSizes = [
  { name: 'icon-add-192.png', size: 192, label: '➕' },
  { name: 'icon-report-192.png', size: 192, label: '📊' },
];

// For now, save as SVG which can be converted to PNG by app stores
iconSizes.forEach(({ name, size, label }) => {
  const svgContent = createIconSVG(size, label);
  const svgPath = path.join(publicDir, name.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✓ Created ${name.replace('.png', '.svg')}`);
});

// Generate screenshot files
const screenshots = [
  { name: 'screenshot-540x720.svg', width: 540, height: 720, label: 'Mobile View' },
  { name: 'screenshot-1280x720.svg', width: 1280, height: 720, label: 'Tablet View' },
];

screenshots.forEach(({ name, width, height, label }) => {
  const svgContent = createScreenshotSVG(width, height, label);
  const svgPath = path.join(publicDir, name);
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✓ Created ${name}`);
});

console.log('\n✅ App assets generated successfully!');
console.log('Note: SVG assets have been created. For production app store submission,');
console.log('convert these to PNG format using your preferred image tool.');

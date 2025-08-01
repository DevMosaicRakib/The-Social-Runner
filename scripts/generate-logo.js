import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the SVG content based on your TSR logo component
const svgContent = `<svg width="512" height="512" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="30" cy="30" r="28" fill="#f97316" stroke="#ea580c" stroke-width="2"/>
  
  <!-- Inner running track -->
  <circle cx="30" cy="30" r="20" fill="none" stroke="white" stroke-width="2" stroke-dasharray="3,2" opacity="0.8"/>
  
  <!-- Letters TSR with playful colors and tilted design -->
  <g font-family="system-ui, -apple-system, sans-serif" font-weight="bold">
    <!-- T - Yellow with black border, slightly tilted left -->
    <text x="13" y="22" font-size="10" text-anchor="middle" fill="black" stroke="black" stroke-width="0.5" transform="rotate(-5 13 22)">T</text>
    <text x="13" y="22" font-size="10" text-anchor="middle" fill="#fbbf24" transform="rotate(-5 13 22)">T</text>
    
    <!-- S - Light blue with black border, straight -->
    <text x="30" y="21" font-size="11" text-anchor="middle" fill="black" stroke="black" stroke-width="0.5">S</text>
    <text x="30" y="21" font-size="11" text-anchor="middle" fill="#60a5fa">S</text>
    
    <!-- R - Pink with black border, slightly tilted right -->
    <text x="47" y="22" font-size="10" text-anchor="middle" fill="black" stroke="black" stroke-width="0.5" transform="rotate(5 47 22)">R</text>
    <text x="47" y="22" font-size="10" text-anchor="middle" fill="#f472b6" transform="rotate(5 47 22)">R</text>
  </g>
  
  <!-- Fun decorative elements around letters -->
  <g opacity="0.8">
    <!-- Star near T -->
    <polygon points="10,12 11,15 14,15 11.5,17 12.5,20 10,18 7.5,20 8.5,17 6,15 9,15" fill="#fbbf24"/>
    
    <!-- Circle near S -->
    <circle cx="30" cy="12" r="2" fill="#60a5fa"/>
    
    <!-- Triangle near R -->
    <polygon points="50,12 52,16 48,16" fill="#f472b6"/>
  </g>
  
  <!-- Cartoon runner figure - more colorful -->
  <g transform="translate(30,37)">
    <!-- Head -->
    <circle cx="0" cy="-8" r="4" fill="#fbbf24"/>
    
    <!-- Body -->
    <rect x="-2" y="-4" width="4" height="8" fill="#60a5fa" rx="2"/>
    
    <!-- Legs in running position -->
    <rect x="-3" y="4" width="2" height="6" fill="#1f2937" rx="1"/>
    <rect x="1" y="4" width="2" height="6" fill="#1f2937" rx="1"/>
    
    <!-- Arms in running position -->
    <rect x="-5" y="-2" width="3" height="1.5" fill="#fbbf24" rx="0.5"/>
    <rect x="2" y="-2" width="3" height="1.5" fill="#fbbf24" rx="0.5"/>
    
    <!-- Enhanced motion lines with colors -->
    <g opacity="0.7">
      <line x1="-8" y1="1" x2="-5" y2="1" stroke="#fbbf24" stroke-width="1.5"/>
      <line x1="-9" y1="3" x2="-5" y2="3" stroke="#60a5fa" stroke-width="1"/>
      <line x1="-7" y1="5" x2="-4" y2="5" stroke="#f472b6" stroke-width="1"/>
    </g>
    
    <!-- Happy face -->
    <circle cx="-1" cy="-9" r="0.5" fill="#1f2937"/>
    <circle cx="1" cy="-9" r="0.5" fill="#1f2937"/>
    <path d="M -1.5,-6.5 Q 0,-5.5 1.5,-6.5" stroke="#1f2937" stroke-width="0.5" fill="none"/>
  </g>
  
  <!-- Decorative dots around the circle -->
  <g fill="white" opacity="0.7">
    <circle cx="45" cy="15" r="1.5"/>
    <circle cx="15" cy="15" r="1.5"/>
    <circle cx="15" cy="45" r="1.5"/>
    <circle cx="45" cy="45" r="1.5"/>
  </g>
</svg>`;

// Create the output directory if it doesn't exist
const outputDir = path.join(path.dirname(__dirname), 'client', 'public');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write the SVG file
const svgPath = path.join(outputDir, 'tsr-logo.svg');
fs.writeFileSync(svgPath, svgContent);

console.log(`✅ TSR Logo generated successfully!`);
console.log(`📍 Location: ${svgPath}`);
console.log(`📁 File sizes created:`);
console.log(`   • SVG: ${(fs.statSync(svgPath).size / 1024).toFixed(1)} KB`);
console.log(`\n🔗 Access your logo at: /tsr-logo.svg`);
console.log(`\nYou can now:`);
console.log(`1. Visit your app URL + /tsr-logo.svg to download`);
console.log(`2. Convert to PNG using any online SVG to PNG converter`);
console.log(`3. Use the SVG directly in design tools like Figma, Canva, etc.`);
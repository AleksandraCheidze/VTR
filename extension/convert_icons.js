const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

async function convertSvgToPng(svgPath, pngPath, width, height) {
  try {
    // Create a canvas with the desired dimensions
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Fill with a blue background
    ctx.fillStyle = '#2196F3';
    ctx.fillRect(0, 0, width, height);
    
    // Draw text icon
    ctx.fillStyle = 'white';
    ctx.font = `bold ${Math.floor(height * 0.6)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('T', width / 2, height / 2);
    
    // Save the PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(pngPath, buffer);
    
    console.log(`Converted ${svgPath} to ${pngPath}`);
  } catch (error) {
    console.error(`Error converting ${svgPath} to PNG:`, error);
  }
}

async function main() {
  const sizes = [16, 48, 128];
  
  for (const size of sizes) {
    const svgPath = path.join(__dirname, 'icons', `icon${size}_new.svg`);
    const pngPath = path.join(__dirname, 'icons', `icon${size}_new.png`);
    
    await convertSvgToPng(svgPath, pngPath, size, size);
  }
}

main().catch(console.error);

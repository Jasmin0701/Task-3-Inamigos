const sharp = require('sharp');
const fs = require('fs');

async function processFavicon() {
  const inputPath = 'public/logo.png';
  const outputPath = 'public/favicon.png';
  
  if (!fs.existsSync(inputPath)) {
    console.error('Logo file not found');
    return;
  }

  const width = 256;
  const height = 256;
  const r = width / 2 - 10; // Crop tighter into the center

  // Create an SVG mask to punch out the circular logo and leave everything else transparent
  const circleSvg = `<svg width="${width}" height="${height}">
    <circle cx="${width/2}" cy="${height/2}" r="${r}" fill="white"/>
  </svg>`;

  const circleSvgBuffer = Buffer.from(circleSvg);

  try {
    await sharp(inputPath)
      .resize(width, height)
      .composite([{
        input: circleSvgBuffer,
        blend: 'dest-in'
      }])
      .png()
      .toFile(outputPath);
    
    console.log('Favicon cropped successfully!');
  } catch (error) {
    console.error('Error cropping image:', error);
  }
}

processFavicon();

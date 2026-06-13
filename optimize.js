const { Jimp } = require('jimp');
const jpeg = require('jpeg-js');
const fs = require('fs');
const path = require('path');

// Helper to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Custom JPEG loader that bypasses Jimp resolution/memory limits
async function readImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') {
    const fileBuf = fs.readFileSync(filePath);
    const rawImageData = jpeg.decode(fileBuf, {
      maxMemoryUsageInMB: 16384, // Set very high memory limits (16GB)
      maxResolutionInMP: 2000   // Set very high resolution limits (2000MP)
    });
    return Jimp.fromBitmap({
      data: rawImageData.data,
      width: rawImageData.width,
      height: rawImageData.height
    });
  }
  return Jimp.read(filePath);
}

async function optimizeImage(filePath, resizeOptions, quality = 75) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ File not found: ${filePath}`);
    return;
  }

  const startSize = fs.statSync(filePath).size;
  console.log(`Processing: ${path.basename(filePath)} (${formatBytes(startSize)})`);

  try {
    const image = await readImage(filePath);
    
    if (resizeOptions) {
      image.resize(resizeOptions);
    }
    
    await image.write(filePath, { quality });
    
    const endSize = fs.statSync(filePath).size;
    const reduction = ((startSize - endSize) / startSize * 100).toFixed(1);
    console.log(`✅ Success: ${path.basename(filePath)} -> ${formatBytes(endSize)} (Reduced by ${reduction}%)`);
    return { name: path.basename(filePath), before: startSize, after: endSize };
  } catch (err) {
    console.error(`❌ Failed to process ${filePath}:`, err.message);
  }
}

async function run() {
  console.log('🚀 Starting image optimization process with custom JPEG decoder...\n');
  const results = [];

  // 1. Logos
  const logo1 = await optimizeImage('NATURE....-01.jpg', { w: 300 }, 80);
  if (logo1) results.push(logo1);

  const logo2 = await optimizeImage('images/NATURE PROBERTIES LOGO-01.jpg', { w: 300 }, 80);
  if (logo2) results.push(logo2);

  // 2. Hero Images
  const hero1 = await optimizeImage('images/plations-01.jpg', { w: 1920 }, 75);
  if (hero1) results.push(hero1);

  const hero2 = await optimizeImage('images/plations.jpg', { w: 1920 }, 75);
  if (hero2) results.push(hero2);

  // 3. Banner Image
  const banner = await optimizeImage('images/IMAGE2-01.jpg', { w: 1200 }, 75);
  if (banner) results.push(banner);

  // 4. Testimonial Avatars (dp)
  const dpDir = 'images/dp';
  if (fs.existsSync(dpDir)) {
    const files = fs.readdirSync(dpDir);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        // Skip temp test files we might have created
        if (file.includes('-test')) continue;
        const dpPath = path.join(dpDir, file);
        // Force square 150x150 for avatars
        const dpResult = await optimizeImage(dpPath, { w: 150, h: 150 }, 75);
        if (dpResult) results.push(dpResult);
      }
    }
  }

  console.log('\n📊 Optimization Summary:');
  console.log('--------------------------------------------------');
  let totalBefore = 0;
  let totalAfter = 0;
  
  results.forEach(res => {
    totalBefore += res.before;
    totalAfter += res.after;
    console.log(`${res.name.padEnd(30)} | ${formatBytes(res.before).padStart(10)} -> ${formatBytes(res.after).padStart(10)}`);
  });
  
  console.log('--------------------------------------------------');
  const totalReduction = ((totalBefore - totalAfter) / totalBefore * 100).toFixed(2);
  console.log(`TOTAL WEIGHT: ${formatBytes(totalBefore)} -> ${formatBytes(totalAfter)} (Savings: ${totalReduction}%)`);
}

run();

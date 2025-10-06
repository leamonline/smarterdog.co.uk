const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const fs = require('fs').promises;
const path = require('path');

const imageExtensions = ['.jpg', '.jpeg', '.png'];
const rootDir = path.join(__dirname, '..');

async function optimizeImages() {
  try {
    // Find all images in root directory
    const files = await fs.readdir(rootDir);
    const imageFiles = files.filter(file =>
      imageExtensions.includes(path.extname(file).toLowerCase())
    );

    if (imageFiles.length === 0) {
      console.log('No images found to optimize');
      return;
    }

    console.log(`Found ${imageFiles.length} images to optimize...`);

    // Convert to WebP
    await imagemin(imageFiles.map(f => path.join(rootDir, f)), {
      destination: rootDir,
      plugins: [
        imageminWebp({ quality: 85 })
      ]
    });

    console.log('✓ Images optimized and converted to WebP');
  } catch (error) {
    console.error('Error optimizing images:', error);
    process.exit(1);
  }
}

optimizeImages();

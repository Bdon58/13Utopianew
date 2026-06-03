import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dir = 'e:/13/full/Comp 1';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

console.log(`Found ${files.length} PNGs to convert...`);

async function convert() {
  let count = 0;
  for (const file of files) {
    const pngPath = path.join(dir, file);
    const webpPath = path.join(dir, file.replace('.png', '.webp'));
    
    // Only convert if it doesn't already exist
    if (!fs.existsSync(webpPath)) {
      await sharp(pngPath)
        .webp({ quality: 75, effort: 4 }) // Good balance of speed and compression
        .toFile(webpPath);
      count++;
      if (count % 20 === 0) console.log(`Converted ${count}/${files.length}...`);
    }
  }
  console.log(`Finished converting ${count} images to WebP!`);
}

convert().catch(console.error);

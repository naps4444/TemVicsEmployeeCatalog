import sharp from 'sharp';
import fs from 'fs';

export async function compressImage(filePath) {
  const compressedPath = `${filePath}-compressed.jpg`;

  await sharp(filePath)
    .resize({ width: 1200 }) // Resize to max width 1200px
    .jpeg({ quality: 80 }) // Convert to JPEG & lower quality
    .toFile(compressedPath);

  return compressedPath;
}

export function deleteTempFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

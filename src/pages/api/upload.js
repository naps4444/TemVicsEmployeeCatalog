import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '@/lib/cloudinary';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Products';
import sharp from 'sharp';
import streamifier from 'streamifier';

// Multer storage setup (stores images in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Disable Next.js bodyParser to support file uploads
export const config = { api: { bodyParser: false } };

// Function to format price properly
const formatPrice = (price) => {
  const priceNumber = parseFloat(price);
  return isNaN(priceNumber) ? null : priceNumber;
};

// Function to upload image to Cloudinary
const uploadToCloudinary = async (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'products', public_id: filename, format: 'jpg', transformation: [{ quality: '80' }] },
      (error, result) => (error ? reject(error) : resolve(result.secure_url))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// API Route Handler
export default async function handler(req, res) {
  if (req.method === 'POST') {
    await dbConnect();

    upload.array('images', 5)(req, res, async function (err) {
      if (err) return res.status(500).json({ error: `Upload error: ${err.message}` });

      try {
        const { name, price } = req.body;
        const formattedPrice = formatPrice(price);
        if (formattedPrice === null) return res.status(400).json({ error: 'Invalid price format' });

        // Process and upload images to Cloudinary
        const imageUrls = [];
        for (const file of req.files) {
          let buffer = file.buffer;

          // Compress if file is larger than 10MB
          if (file.size > 10 * 1024 * 1024) {
            buffer = await sharp(file.buffer).resize({ width: 1200 }).jpeg({ quality: 80 }).toBuffer();
          }

          const cloudUrl = await uploadToCloudinary(buffer, `${name}-${Date.now()}`);
          imageUrls.push(cloudUrl);
        }

        // Save product to MongoDB
        const product = await Product.create({ name, price: formattedPrice, images: imageUrls });

        return res.status(201).json({ message: 'Product created successfully', product });
      } catch (error) {
        return res.status(500).json({ error: `Failed to save product: ${error.message}` });
      }
    });
  } else {
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

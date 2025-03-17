import dbConnect from '@/lib/mongodb';
import Product from '@/models/Products';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '@/lib/cloudinary';
import sharp from 'sharp'; // Image compression
import fs from 'fs/promises'; // Handle temporary files
import { promisify } from 'util';

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'products',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

const upload = multer({ storage });
const uploadMiddleware = promisify(upload.array('images', 5));

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const products = await Product.find();
      return res.status(200).json(products);
    } catch (error) {
      return res.status(500).json({ error: `Fetch error: ${error.message}` });
    }
  }

  if (req.method === 'POST') {
    try {
      await uploadMiddleware(req, res);
      const { name, price } = req.body;
      const imageUrls = [];

      for (const file of req.files) {
        const tempPath = `./tmp/${file.originalname}`;
        await fs.writeFile(tempPath, file.buffer);

        // Compress large images
        await sharp(tempPath).resize(1000).jpeg({ quality: 70 }).toFile(`${tempPath}-compressed.jpg`);

        // Upload compressed image to Cloudinary
        const uploadedImage = await cloudinary.uploader.upload(`${tempPath}-compressed.jpg`, {
          folder: 'products',
          public_id: `${name}-${price}-${Date.now()}`,
        });

        imageUrls.push(uploadedImage.secure_url);

        // Cleanup temp files
        await fs.unlink(tempPath);
        await fs.unlink(`${tempPath}-compressed.jpg`);
      }

      const product = await Product.create({ name, price, images: imageUrls });

      return res.status(201).json({ message: 'Product created', product });
    } catch (error) {
      return res.status(500).json({ error: `Upload error: ${error.message}` });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      const deletedProduct = await Product.findByIdAndDelete(id);

      if (!deletedProduct) return res.status(404).json({ error: 'Product not found' });

      return res.status(200).json({ message: 'Product deleted' });
    } catch (error) {
      return res.status(500).json({ error: `Deletion error: ${error.message}` });
    }
  }

  if (req.method === 'PUT') {
    try {
      await uploadMiddleware(req, res);
      const { id, name, price, images } = req.body;

      if (!id) return res.status(400).json({ error: 'Product ID is required' });

      const existingProduct = await Product.findById(id);
      if (!existingProduct) return res.status(404).json({ error: 'Product not found' });

      let imageUrls = Array.isArray(images) ? images : existingProduct.images;

      // Handle new image uploads
      if (req.files.length > 0) {
        for (const file of req.files) {
          const tempPath = `./tmp/${file.originalname}`;
          await fs.writeFile(tempPath, file.buffer);

          await sharp(tempPath).resize(1000).jpeg({ quality: 70 }).toFile(`${tempPath}-compressed.jpg`);

          const uploadedImage = await cloudinary.uploader.upload(`${tempPath}-compressed.jpg`, {
            folder: 'products',
            public_id: `${name}-${price}-${Date.now()}`,
          });

          imageUrls.push(uploadedImage.secure_url);

          await fs.unlink(tempPath);
          await fs.unlink(`${tempPath}-compressed.jpg`);
        }
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { name, price, images: imageUrls },
        { new: true }
      );

      return res.status(200).json({ message: 'Product updated', product: updatedProduct });
    } catch (error) {
      return res.status(500).json({ error: `Update error: ${error.message}` });
    }
  }

  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}

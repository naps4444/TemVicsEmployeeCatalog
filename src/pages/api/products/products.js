import dbConnect from '@/lib/mongodb';
import Product from '@/models/Products';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '@/lib/cloudinary';
import sharp from 'sharp'; // Image compression
import { promisify } from 'util';

// Multer Storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'products',
      allowed_formats: ['jpg', 'jpeg', 'png'],
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

const upload = multer({ storage });
const uploadMiddleware = promisify(upload.array('images', 5));

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const products = await Product.find();
    return res.status(200).json(products);
  }

  if (req.method === 'POST') {
    try {
      await uploadMiddleware(req, res);

      const { name, price } = req.body;
      const imageUrls = [];

      for (const file of req.files) {
        let imageBuffer = file.buffer;

        // Compress images larger than 10MB
        if (file.size > 10 * 1024 * 1024) {
          imageBuffer = await sharp(file.buffer).resize(1000).jpeg({ quality: 70 }).toBuffer();
        }

        // Upload to Cloudinary
        const uploadedImage = await cloudinary.uploader.upload(imageBuffer, {
          folder: 'products',
          public_id: `${name}-${price}-${Date.now()}`,
        });

        imageUrls.push(uploadedImage.secure_url);
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
      await Product.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Product deleted' });
    } catch (error) {
      return res.status(500).json({ error: `Deletion error: ${error.message}` });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, name, price, images } = req.body;
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { name, price, images },
        { new: true }
      );

      if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });

      return res.status(200).json({ message: 'Product updated', product: updatedProduct });
    } catch (error) {
      return res.status(500).json({ error: `Update error: ${error.message}` });
    }
  }

  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}

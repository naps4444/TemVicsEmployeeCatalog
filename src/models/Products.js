import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String, required: true }], // Array of image URLs
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);

import dbConnect from '@/lib/mongodb';
import Product from '@/models/Products';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const products = await Product.find();
    return res.status(200).json(products);
  }

  if (req.method === 'POST') {
    const { name, price, images } = req.body;
    const product = await Product.create({ name, price, images });
    return res.status(201).json({ message: 'Product created', product });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    await Product.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Product deleted' });
  }

  if (req.method === 'PUT') {
    const { id, name, price, images } = req.body;
    await Product.findByIdAndUpdate(id, { name, price, images });
    return res.status(200).json({ message: 'Product updated' });
  }

  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}

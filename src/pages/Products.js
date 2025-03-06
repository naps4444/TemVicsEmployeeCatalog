import { useEffect, useState } from 'react';

export default function ProductItem() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', images: [] });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      setProducts(products.filter((product) => product._id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setFormData({ name: product.name, price: product.price, images: [...product.images] });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editProduct._id, ...formData }),
      });

      if (!res.ok) throw new Error('Failed to update product');

      fetchProducts();
      setEditProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedImages = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'your_upload_preset'); // Replace with your Cloudinary preset

      const res = await fetch('https://api.cloudinary.com/v1_1/your_cloudinary_name/image/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      uploadedImages.push(data.secure_url);
    }

    setFormData((prev) => ({ ...prev, images: [...prev.images, ...uploadedImages] }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product List</h1>

      {editProduct && (
        <div className="mb-4 p-4 border rounded shadow">
          <h2 className="text-lg font-semibold">Edit Product</h2>
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border p-2 rounded w-full mt-2"
          />
          <input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="border p-2 rounded w-full mt-2"
          />

          {/* Image Upload */}
          <input type="file" multiple onChange={handleImageUpload} className="mt-2" />

          {/* Display Uploaded Images */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {formData.images.map((image, index) => (
              <div key={index} className="relative">
                <img src={image} alt={`Product ${index + 1}`} className="w-full h-32 object-cover rounded" />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
                >
                  X
                </button>
              </div>
            ))}
          </div>

          <button onClick={handleUpdate} className="bg-blue-500 text-white p-2 rounded mt-2">
            Update
          </button>
          <button onClick={() => setEditProduct(null)} className="ml-2 text-red-500">
            Cancel
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product._id} className="border p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
            <p className="text-gray-600">₦{Number(product.price).toLocaleString()}</p>

            {/* Display all product images */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
              ))}
            </div>

            <div className="mx-auto flex justify-between">
              <button
                onClick={() => handleEdit(product)}
                className="bg-black w-3/6 mx-auto text-white p-2 rounded-lg mt-2 transition-all duration-300 hover:bg-gray-800 hover:scale-105"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(product._id)}
                className="bg-yellow-900 w-3/6 mx-auto text-white p-2 rounded-lg mt-2 ml-2 transition-all duration-300 hover:bg-yellow-700 hover:scale-105"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

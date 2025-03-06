import { useState } from 'react';
import ProductItem from './Products';

export default function UploadForm() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    files.forEach(file => formData.append('images', file));

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setLoading(false);
      setMessage(res.ok ? 'Product uploaded successfully!' : `Upload failed: ${data.error}`);
    } catch (error) {
      setLoading(false);
      setMessage('An error occurred while uploading');
    }
  };

  return (
    <>
      <form onSubmit={handleUpload} className="flex flex-col gap-4 w-10/12 md:w-6/12 mx-auto">
        <input 
          type="text" 
          placeholder="Product Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required
          className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
        />
        
        <input 
          type="number" 
          placeholder="Price" 
          value={price} 
          onChange={(e) => setPrice(e.target.value)} 
          required
          className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
        />
        
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={(e) => setFiles([...e.target.files])} 
          required
          className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black"
        />
        
        <button 
          type="submit" 
          className="border border-black hover:bg-black hover:text-white w-2/6 md:w-2/6 py-2 mx-auto rounded-md transition-all duration-300"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload Product'}
        </button>

        {message && <p className="text-center text-sm text-gray-600">{message}</p>}
      </form>

      <div>
        <ProductItem/>
      </div>
    </>
  );
}

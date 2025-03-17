import { useState } from "react";

export default function UploadForm() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // Limit file size (max 5MB per file)
    const maxSize = 5 * 1024 * 1024;
    const filteredFiles = selectedFiles.filter((file) => file.size <= maxSize);

    if (filteredFiles.length !== selectedFiles.length) {
      alert("Some files are too large. Max size is 5MB.");
    }

    setFiles(filteredFiles);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      alert("Please select at least one image.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    files.forEach((file) => formData.append("images", file));

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setMessage(res.ok ? "Product uploaded successfully!" : `Upload failed: ${data.error}`);
    } catch (error) {
      setMessage("An error occurred while uploading");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="bg-[#504B38]">
    <form onSubmit={handleUpload} className="flex flex-col gap-4 w-10/12 md:w-6/12 mx-auto py-[100px] bg-[#504B38]">
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black bg-[#B9B28A] placeholder:text-white"
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black bg-[#B9B28A] placeholder:text-white"
        />

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          required
          className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-black bg-[#B9B28A] placeholder:text-white"
        />

        <button
          type="submit"
          className="border border-black hover:bg-black text-white w-3/6 md:w-2/6 py-2 mx-auto rounded-md transition-all duration-300"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload Product"}
        </button>

        {message && <p className="text-center text-sm text-gray-600">{message}</p>}
      </form>

    </div>
      

    </>
  );
}

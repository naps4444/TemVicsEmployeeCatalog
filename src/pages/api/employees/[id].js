import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  await dbConnect();

  console.log("🛠️ Request Info:", { method: req.method, query: req.query, body: req.body });

  const { id } = req.query;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid or missing Employee ID" });
  }

  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(403).json({ error: "Not authenticated" });
  }

  // ✅ Handle GET request to fetch employee data
  if (req.method === "GET") {
    try {
      const employee = await User.findById(id).select("-password"); // Exclude sensitive fields
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      return res.status(200).json(employee.toObject());
    } catch (error) {
      console.error("🚨 Error fetching employee:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // ✅ Handle PUT request to update employee data
  if (req.method === "PUT") {
    try {
      const { age, education, state, religion, image, department, role } = req.body;
      if (!age || !education || !state || !department || !role) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      let imageUrl = image;
      if (image && image.startsWith("data:image")) {
        console.log("📸 Uploading image to Cloudinary...");
        try {
          const uploadedImage = await cloudinary.uploader.upload(image, { folder: "employee_images" });
          imageUrl = uploadedImage.secure_url;
        } catch (uploadError) {
          console.error("🚨 Cloudinary Upload Error:", uploadError);
          return res.status(500).json({ error: "Failed to upload image" });
        }
      }

      const updatedEmployee = await User.findByIdAndUpdate(
        id,
        { age, education, state, religion, image: imageUrl, department, role },
        { new: true, runValidators: true }
      );

      if (!updatedEmployee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      return res.status(200).json(updatedEmployee.toObject());
    } catch (error) {
      console.error("🚨 Error updating employee:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}

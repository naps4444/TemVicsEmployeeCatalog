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

  console.log("🛠️ Incoming Request:", {
    method: req.method,
    query: req.query,
    body: req.body,
  });

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Handle preflight request
  }

  const { id } = req.query;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid or missing Employee ID" });
  }

  // ✅ Ensure the user is authenticated
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    console.warn("⚠️ Unauthorized access attempt.");
    return res.status(403).json({ error: "Not authenticated" });
  }

  console.log(`🔍 Authenticated request from: ${session.user.email}`);

  // ✅ Handle GET request (Fetch Employee Data)
  if (req.method === "GET") {
    try {
      const employee = await User.findById(id).select("-password"); // Exclude password
      if (!employee) {
        console.warn(`⚠️ Employee with ID ${id} not found.`);
        return res.status(404).json({ error: "Employee not found" });
      }
      console.log("✅ Employee data fetched successfully.");
      return res.status(200).json(employee.toObject());
    } catch (error) {
      console.error("🚨 Error fetching employee:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // ✅ Handle PUT request (Update Employee Data)
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
          console.log("✅ Image uploaded successfully.");
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

      console.log("✅ Employee updated successfully.");
      return res.status(200).json(updatedEmployee.toObject());
    } catch (error) {
      console.error("🚨 Error updating employee:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // ✅ Handle DELETE request (Remove Employee)
  if (req.method === "DELETE") {
    try {
      // Ensure only admins can delete employees
      const adminUser = await User.findById(session.user.id);
      if (!adminUser || adminUser.role !== "admin") {
        console.warn("🚫 Access Denied: User is not an admin.");
        return res.status(403).json({ error: "Access denied. Admins only." });
      }

      // Check if the user exists
      const targetUser = await User.findById(id);
      if (!targetUser) {
        return res.status(404).json({ error: "Employee not found." });
      }

      // Delete the employee's image from Cloudinary if exists
      if (targetUser.image) {
        console.log("🗑️ Deleting employee image from Cloudinary...");
        try {
          const publicId = targetUser.image.split("/").pop().split(".")[0]; // Extract public ID
          await cloudinary.uploader.destroy(`employee_images/${publicId}`);
          console.log("✅ Employee image deleted.");
        } catch (cloudError) {
          console.error("⚠️ Cloudinary image deletion failed:", cloudError);
        }
      }

      // Delete user from DB
      await User.findByIdAndDelete(id);
      console.log("✅ Employee deleted successfully.");
      return res.status(200).json({ message: "Employee deleted successfully." });

    } catch (error) {
      console.error("🚨 Error deleting employee:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // ✅ Handle Unsupported Methods
  console.warn(`⚠️ Method ${req.method} not allowed.`);
  return res.status(405).json({ error: "Method Not Allowed" });
}

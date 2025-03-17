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

// Increase the request body size limit
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // ✅ Allow larger request bodies (fixes 413 error)
    },
  },
};

export default async function handler(req, res) {
  await dbConnect();

  console.log("📢 Incoming Request:", {
    method: req.method,
    query: req.query,
    body: req.body,
    headers: req.headers,
  });

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { id } = req.query;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    console.warn("⚠️ Invalid or missing Employee ID:", id);
    return res.status(400).json({ error: "Invalid or missing Employee ID" });
  }

  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    console.warn("⚠️ Unauthorized access attempt.");
    return res.status(403).json({ error: "Not authenticated" });
  }

  console.log(`🔍 Authenticated request from: ${session.user.email}`);

  if (req.method === "GET") {
    try {
      console.log("🔍 Fetching employee with ID:", id);
      const employee = await User.findById(id).select("-password");
      if (!employee) {
        console.warn(`⚠️ Employee with ID ${id} not found.`);
        return res.status(404).json({ error: "Employee not found" });
      }
      console.log("✅ Employee data fetched successfully:", employee);
      return res.status(200).json(employee.toObject());
    } catch (error) {
      console.error("🚨 Error fetching employee:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "PUT") {
    try {
      const bodySize = JSON.stringify(req.body).length;
      console.log(`📦 Request payload size: ${bodySize} bytes`);

      if (bodySize > 10 * 1024 * 1024) {
        return res.status(413).json({ error: "Request body too large" });
      }

      const updatedEmployee = await User.findByIdAndUpdate(id, req.body, {
        new: true,
      }).select("-password");

      if (!updatedEmployee) {
        console.warn(`⚠️ Employee with ID ${id} not found.`);
        return res.status(404).json({ error: "Employee not found" });
      }

      console.log("✅ Employee updated successfully:", updatedEmployee);
      return res.status(200).json(updatedEmployee);
    } catch (error) {
      console.error("🚨 Error updating employee:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  console.warn(`⚠️ Method ${req.method} not allowed.`);
  return res.status(405).json({ error: "Method Not Allowed" });
}

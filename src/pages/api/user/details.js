import { getSession } from "next-auth/react";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Prevent caching
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    await dbConnect();
    
    const session = await getSession({ req });
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized: No valid session" });
    }

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
      return res.status(400).json({ error: "Invalid Employee ID format" });
    }

    const user = await User.findById(session.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("🚨 Error fetching user details:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// ✅ Increase API body size limit (prevents 'Body exceeds limit' error)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

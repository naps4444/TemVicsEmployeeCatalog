import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "../../../lib/mongodb";
import User from "../../../models/User";
import cloudinary from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized: No valid session" });
    }

    const { age, education, state, religion, image } = req.body;

    if (!age || !education || !state || !religion) {
      return res.status(400).json({ error: "All fields are required" });
    }

    await dbConnect();

    let imageUrl = image; // Keep existing image unless a new one is uploaded

    if (image && image.startsWith("data:image")) {
      console.log("📸 Uploading image to Cloudinary...");
      try {
        const uploadedImage = await cloudinary.uploader.upload(image, {
          folder: "employee_images",
        });
        imageUrl = uploadedImage.secure_url;
      } catch (uploadError) {
        console.error("🚨 Error uploading image to Cloudinary:", uploadError);
        return res.status(500).json({ error: "Failed to upload image" });
      }
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          age,
          education,
          state,
          religion,
          image: imageUrl,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("🚨 Error updating profile:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

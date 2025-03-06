import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Ensure database connection
    await dbConnect();

    // Get session from NextAuth
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const { user } = session;
    const { userId } = req.body; // ID of the user to be deleted

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    // Fetch the authenticated user from the database
    const adminUser = await User.findById(user.id || user._id);

    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    // Check if the target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found." });
    }

    // Ensure an admin can delete another admin
    if (targetUser.role === "admin" && adminUser.id !== userId) {
      console.log(`🔴 Admin ${adminUser.email} is deleting another admin: ${targetUser.email}`);
    }

    // Prevent self-deletion
    if (adminUser.id === userId) {
      return res.status(400).json({ error: "You cannot delete yourself." });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);
    return res.status(200).json({ message: "User deleted successfully." });

  } catch (error) {
    console.error("🚨 Error deleting user:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}

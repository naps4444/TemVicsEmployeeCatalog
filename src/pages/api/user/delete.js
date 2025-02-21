import { getServerSession } from "next-auth/next";
import connectDB from "../../lib/mongodb";
import User from "../../models/User";
import { authOptions } from "./auth/[...nextauth]"; // Adjust the path based on your project structure

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  await connectDB();
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  const { user } = session;
  const { userId } = req.body; // Make sure userId is properly received

  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }

  try {
    // Fetch the authenticated user from the database
    const adminUser = await User.findById(user.id);

    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    // Check if the user to delete exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found." });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);
    return res.status(200).json({ message: "User deleted successfully." });

  } catch (error) {
    console.error("🚨 Error deleting user:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export async function isAdmin(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== "admin") {
    res.status(403).json({ message: "Access denied. Admins only." });
    return false;
  }
  return true;
}

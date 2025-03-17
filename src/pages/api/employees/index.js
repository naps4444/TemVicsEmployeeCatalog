import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  await dbConnect();

  // Set CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    try {
      console.log("✅ Fetching employees...");
      const employees = await User.find().select("-password");

      if (!Array.isArray(employees)) {
        console.error("⚠️ Unexpected data format:", employees);
        return res.status(500).json({ error: "Unexpected data format" });
      }

      return res.status(200).json({ employees });
    } catch (error) {
      console.error("🚨 Error fetching employees:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id } = req.query; // Get employee ID from request URL
      console.log(`🗑️ Deleting employee with ID: ${id}`);

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        console.warn("⚠️ Invalid or missing Employee ID:", id);
        return res.status(400).json({ error: "Invalid or missing Employee ID" });
      }

      const deletedEmployee = await User.findByIdAndDelete(id);
      if (!deletedEmployee) {
        console.warn(`⚠️ Employee with ID ${id} not found.`);
        return res.status(404).json({ error: "Employee not found" });
      }

      console.log("✅ Employee deleted successfully");
      return res.status(200).json({ message: "Employee deleted", id });
    } catch (error) {
      console.error("🚨 Error deleting employee:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  console.warn(`⚠️ Method ${req.method} not allowed.`);
  return res.status(405).json({ error: `Method ${req.method} not allowed.` });
}

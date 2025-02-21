import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    console.log("✅ Connecting to MongoDB...");
    await dbConnect();
    console.log("✅ Connected successfully");

    console.log("📌 Fetching employees from DB...");
    const employees = await User.find().select("-password");
    console.log(`✅ Employees Retrieved: ${employees.length}`);

    return res.status(200).json({ employees });
  } catch (error) {
    console.error("🚨 Error fetching employees:", error);
    return res.status(500).json({ 
      error: error.message || "Internal Server Error", 
      employees: [] 
    });
  }
}

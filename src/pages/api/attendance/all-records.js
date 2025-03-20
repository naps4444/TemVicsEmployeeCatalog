import dbConnect from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import User from "@/models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await dbConnect();

    // Populate employeeId to get user details
    const allRecords = await Attendance.find({})
      .populate("employeeId", "name") // ✅ Fetch only the "name" field from User model
      .sort({ signInTime: -1 });

    console.log("Fetched Records:", allRecords); // 🔍 Debug: Check if names exist

    return res.status(200).json(allRecords);
  } catch (error) {
    console.error("Error fetching all records:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

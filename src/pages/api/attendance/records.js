import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Attendance from "@/models/Attendance";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    console.log("📡 Connecting to MongoDB...");
    await dbConnect();
    console.log("✅ MongoDB Connected!");

    // Fetch all employees
    const employees = await User.find({}, "_id name").lean();

    // Fetch attendance records for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceRecords = await Attendance.find({ date: { $gte: today } }).lean();

    console.log("📋 Fetched Attendance Records:", attendanceRecords);

    // Map attendance records to employees
    const attendanceStatus = employees.map((employee) => {
      const record = attendanceRecords.find(
        (rec) => rec.employeeId.toString() === employee._id.toString()
      );

      return {
        name: employee.name,
        signInTime: record?.signInTime || "Not Signed In",
        signOutTime: record?.signOutTime || "Not Signed Out",
      };
    });

    console.log("✅ Formatted Attendance Data:", attendanceStatus);
    return res.status(200).json(attendanceStatus);
  } catch (error) {
    console.error("❌ Error Fetching Attendance Records:", error);
    return res.status(500).json({ error: "Failed to fetch records", details: error.message });
  }
}

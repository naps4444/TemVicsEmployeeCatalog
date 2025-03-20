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

    const { filterType } = req.query; // Accept filter type from frontend
    let startDate, endDate;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filterType) {
      case "day":
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 1); // Next day at midnight
        break;
      case "week":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 6); // 7 days range
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 1);
        break;
      case "month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1); // Start of month
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 1);
        break;
      case "year":
        startDate = new Date(today.getFullYear(), 0, 1); // Start of year
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 1);
        break;
      default:
        return res.status(400).json({ error: "Invalid filter type" });
    }

    console.log(`🔍 Fetching records from ${startDate} to ${endDate}`);

    const employees = await User.find({}, "_id name").lean();

    const attendanceRecords = await Attendance.find({
      date: { $gte: startDate, $lt: endDate },
    }).lean();

    console.log("📋 Attendance Records:", attendanceRecords);

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

    return res.status(200).json(attendanceStatus);
  } catch (error) {
    console.error("❌ Error Fetching Attendance Records:", error);
    return res.status(500).json({ error: "Failed to fetch records", details: error.message });
  }
}

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Attendance from "@/models/Attendance";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await dbConnect();

    // Get today's date in YYYY-MM-DD format
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Fetch all employees
    const employees = await User.find({}, "_id name");

    // Fetch today's attendance records
    const attendanceRecords = await Attendance.find({
      signInTime: { $gte: todayStart },
    });

    // Map employees to attendance status
    const attendanceStatus = employees.map((employee) => {
      const attendance = attendanceRecords.find(
        (record) => record.employeeId.toString() === employee._id.toString()
      );

      return {
        id: employee._id,
        name: employee.name,
        signedIn: !!attendance, // true if signed in today
        signInTime: attendance ? attendance.signInTime : null,
        signOutTime: attendance ? attendance.signOutTime : null,
      };
    });

    return res.status(200).json(attendanceStatus);
  } catch (error) {
    console.error("Error fetching attendance status:", error);
    return res.status(500).json({ error: "Failed to fetch attendance data" });
  }
}

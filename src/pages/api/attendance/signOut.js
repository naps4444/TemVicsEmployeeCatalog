import dbConnect from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.setHeader("Allow", ["POST"]).status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { employeeId, password } = req.body;

  if (!employeeId || !password) {
    console.error("🚨 Missing employeeId or password in request body");
    return res.status(400).json({ error: "Employee ID and password are required" });
  }

  try {
    // Fetch employee's stored password
    const user = await User.findById(employeeId).select("password");

    if (!user) {
      console.error("❌ Employee not found:", employeeId);
      return res.status(404).json({ error: "Employee not found" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error("❌ Incorrect password for:", employeeId);
      return res.status(401).json({ error: "Invalid password" });
    }

    // Check if the employee has signed in today
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of the day

    const attendanceRecord = await Attendance.findOne({
      employeeId,
      signInTime: { $gte: today }, // Ensures we only check for today's record
    });

    if (!attendanceRecord) {
      console.error("❌ No sign-in record found for:", employeeId);
      return res.status(404).json({ error: "No sign-in record found" });
    }

    if (attendanceRecord.signOutTime) {
      return res.status(400).json({ error: "Already signed out today" });
    }

    // Set sign-out time
    attendanceRecord.signOutTime = new Date();
    await attendanceRecord.save();

    res.status(200).json({ message: "Sign-out successful", attendance: attendanceRecord });
  } catch (error) {
    console.error("❌ Sign-out error:", error);
    res.status(500).json({ error: "Failed to sign out" });
  }
}

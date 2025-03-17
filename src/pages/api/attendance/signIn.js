import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Attendance from "@/models/Attendance";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await dbConnect(); // ✅ Ensure database connection

    const { employeeId, password, date } = req.body;

    // ✅ Validate required fields
    if (!employeeId || !password || !date) {
      return res.status(400).json({ error: "Employee ID, password, and date are required" });
    }

    console.log("📌 Received Sign-In Request:", { employeeId, date });

    // ✅ Format date to YYYY-MM-DD
    const formattedDate = new Date(date).toISOString().split("T")[0];

    // ✅ Check if employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // ✅ Verify password
    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // ✅ Check if attendance record exists for today
    let attendance = await Attendance.findOne({ employeeId, date: formattedDate });

    if (attendance) {
      console.log("📌 Employee already signed in:", attendance);
      return res.status(200).json({ message: "Already signed in", attendance });
    }

    // ✅ Save new attendance record
    attendance = await Attendance.create({
      employeeId,
      date: formattedDate,
      signInTime: new Date().toISOString(),
    });

    console.log("✅ Sign-In Successful:", attendance);

    return res.status(200).json({
      message: "Signed in successfully",
      attendance,
    });

  } catch (error) {
    console.error("❌ Sign-in error:", error);
    return res.status(500).json({ error: "Failed to sign in. Please try again." });
  }
}

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Attendance from "@/models/Attendance";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const employees = await User.find();
      const today = new Date().toISOString().split("T")[0]; // Get today's date
      const attendance = await Attendance.find({ date: today });

      res.status(200).json({ employees, attendance });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attendance data." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

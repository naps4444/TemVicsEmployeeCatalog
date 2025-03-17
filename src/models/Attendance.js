import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: Date, required: true },
  signInTime: { type: Date, default: null },
  signOutTime: { type: Date, default: null },
});

export default mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);

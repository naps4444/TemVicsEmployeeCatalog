import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true, default: Date.now },
  signInTime: { type: Date },
  signOutTime: { type: Date }
});

export default mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);

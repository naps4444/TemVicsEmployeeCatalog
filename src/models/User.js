import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "employee" },
  department: { type: String, default: "General" }, 
  age: { type: Number },
  education: { type: String },
  state: { type: String },
  religion: { type: String },
  image: { type: String }, 
  accountNumber: { type: String, required: true }, 
  bankCode: { type: String, required: true } 
});

export default mongoose.models.User || mongoose.model("User", UserSchema);

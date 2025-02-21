import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  console.log("Incoming request:", req.method, req.body); // Debug request
  
  if (req.method !== "POST") {
    console.log("Invalid request method:", req.method);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, password, department, role } = req.body;
  if (!name || !email || !password || !department || !role) {
    console.log("Missing fields:", { name, email, password, department, role });
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await dbConnect();
    console.log("✅ MongoDB connected successfully");

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("🚨 User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    console.log("✅ Creating new user...");
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, department, role });
    await newUser.save();

    console.log("✅ User created successfully:", newUser);

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1h" }
    );

    console.log("✅ JWT Token generated");

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
      },
    });
  } catch (error) {
    console.error("🚨 Server Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
}

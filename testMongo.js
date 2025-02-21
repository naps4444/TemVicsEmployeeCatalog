import mongoose from "mongoose";
const uri = process.env.MONGODB_URI;

async function testConnection() {
  try {
    await mongoose.connect(uri);
    console.log("✅ Successfully connected to MongoDB!");
    process.exit(0);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

testConnection();

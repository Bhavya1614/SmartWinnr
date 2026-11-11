
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("./models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "admin@smartwinnr.com";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      return;
    }

    await User.create({
      name: "SmartWinnr Admin",
      email,
      password: "Admin@12345",
      role: "admin"
    });

    console.log("Admin account created successfully!");
    console.log("Email:", email);
    console.log("Password: Admin@12345");

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();

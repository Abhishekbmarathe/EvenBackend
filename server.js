import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import User from "./models/Login.js";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB connection
const DBName = "eventManagement";
mongoose
  .connect(
    "mongodb+srv://abhishekbmarathe:ZqzcppLmZUYfjSl0@testdb.j0frvll.mongodb.net/" +
      DBName +
      "?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("✅ MONGODB connection successful :)");
  })
  .catch((err) => {
    console.log("❌ MONGODB connection Failed...", err);
  });

/* ---------------- ROUTES ---------------- */

// Home
app.get("/", (req, res) => {
  res.send("Hello, Node.js simple backend 🚀");
});

// Signup
app.post("/api/signup", async (req, res) => {
  try {
    const { role, username, password } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user = new User({ role, username, password });
    await user.save();

    res.json({ message: "✅ User created", userId: user._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Signin
app.post("/api/signin", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) return res.status(400).json({ error: "User not found" });
  if (user.password !== password)
    return res.status(400).json({ error: "Invalid credentials" });

  // Return single object with user details
  res.json({
    message: "✅ Login success",
    user: {
      userId: user._id,
      username: user.username,
      role: user.role,  // make sure role exists in your schema
    },
  });
});


// Example: Profile (just fetch user by id)
app.get("/api/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // don’t return password
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "Welcome!", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

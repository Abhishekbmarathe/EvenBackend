import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import multer from "multer";
import User from "./models/Login.js";
import Event from "./models/Events.js"; // ✅ make sure you created this schema

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

/* ---------------- MULTER CONFIG ---------------- */
const storage = multer.memoryStorage(); // keep file in memory (no folder)
const upload = multer({ storage });

/* ---------------- ROUTES ---------------- */

// Home
app.get("/", (req, res) => {
  res.send("Hello, Node.js simple backend 🚀");
});

// Signup
app.post("/api/signup", async (req, res) => {
  try {
    const { role, username, password } = req.body;
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

  res.json({
    message: "✅ Login success",
    user: {
      userId: user._id,
      username: user.username,
      role: user.role,
    },
  });
});




// Profile
app.get("/api/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Welcome!", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ---------------- EVENTS ROUTES ---------------- */
// ✅ Now supports multipart/form-data with base64 storage
app.post("/api/events", upload.single("image"), async (req, res) => {
  try {
    const { userId, title, date, location, organizer, description } = req.body;

    // validate required fields
    if (!title || !date || !location || !organizer) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // if image uploaded, convert buffer to base64
    const image = req.file
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
      : null;

    const event = new Event({
      userId,
      title,
      date,
      location,
      organizer,
      description,
      image, // ✅ saved as base64 string
    });

    await event.save();

    res.status(201).json({ message: "✅ Event created", event });
  } catch (err) {
    console.error("❌ Event creation failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// get all events
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// update status
app.put("/api/events/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


app.patch("/api/events/:id/view", async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } }, // increment views
      { new: true }
    );

    if (!event) return res.status(404).json({ error: "Event not found" });

    res.json({ message: "View count updated", views: event.views });
  } catch (error) {
    console.error("❌ Error updating views:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get events created by a specific user
app.get("/api/events/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const events = await Event.find({ userId }); // find all events by this user

    res.status(200).json(events);
  } catch (err) {
    console.error("❌ Error fetching user events:", err);
    res.status(500).json({ error: "Server error" });
  }
});










/* ---------------- SERVER ---------------- */
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["Admin", "Organizer", "User"],
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    // minlength: 6,
  },
});

const User = mongoose.model("User", userSchema);

export default User;

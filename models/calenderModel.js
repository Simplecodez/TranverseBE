import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, "Please provide a project name."],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  time: {
    type: Number,
    default: 1,
  },
});

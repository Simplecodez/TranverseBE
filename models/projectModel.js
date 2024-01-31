import mongoose from "mongoose";
import validator from "validator";

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: [true, "Please provide a project name."],
  },
  description: {
    type: String,
    required: [true, "Please provide a project description."],
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  teamMembers: {
    type: Array,
    default: [],
  },
  duration: {
    type: Number,
    required: [true, "Please provide a duration."],
  },
  status: {
    type: String,
    enum: ["to-do", "in-progress", "completed"],
    default: "to-do",
  },
  startDate: {
    type: Date,
    required: [true, "Please provide a start date."],
  },
  endDate: {
    type: Date,
    required: [true, "Please provide an end date."],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Project", projectSchema);

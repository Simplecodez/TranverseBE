import mongoose from "mongoose";
import validator from 'validator';

const calenderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "User",
    },
    event: {
      type: String,
      required: [true, "Event field is required"],
      validate: {
        validator: (value) => {
          return validator.isLength(value, { min: 3, max: 50 })&&validator.matches(value, /^[a-zA-Z0-9\s]+$/)
        },
        message: 'Please your name must be 3 or more characters.',
    }
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    day: {
      type: String,
      required: [true, "Day is required"],
    },
    month: {
      type: String,
      required: [true, "Month is required"],
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Calender", calenderSchema);
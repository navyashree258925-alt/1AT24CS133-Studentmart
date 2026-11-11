import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    usn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    college: {
      type: String,
      default: "",
    },
    course: {
      type: String,
      default: "",
    },
    year: {
      type: String,
      default: "2nd Year",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Student = mongoose.model("Student", studentSchema);

export default Student;

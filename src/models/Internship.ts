import { model, Schema } from "mongoose";

const internshipSchema = new Schema(
  {
    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    position: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    availableSlots: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isInteger,
    },
  },
  { timestamps: true },
);

export const InternshipModel = model("Internship", internshipSchema);

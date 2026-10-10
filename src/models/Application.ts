import { model, Schema } from "mongoose";
import { ApplicationStatus } from "../types/index.js";

const applicationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    applicantId: {
      type: Number,
      required: true,
      min: 1,
      max: 1_000_000,
    },
    internshipId: {
      type: Number,
      required: true,
      min: 1,
      max: 1_000_000,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(ApplicationStatus),
    },
  },
  { timestamps: true },
);

export const ApplicationModel = model("Application", applicationSchema);

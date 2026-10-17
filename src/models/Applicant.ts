import { model, Schema } from "mongoose";
import { Role } from "../types/index.js";

const applicantSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      maxlength: 254,
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(Role),
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_document, returnedObject) => {
        const { _id, __v, userId, ...applicant } = returnedObject;
        void __v;
        void userId;
        return { ...applicant, id: _id.toString() };
      },
    },
  },
);

export const ApplicantModel = model("Applicant", applicantSchema);

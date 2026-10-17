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
      type: String,
      required: true,
    },
    internshipId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: ApplicationStatus.Pending,
      required: true,
      enum: Object.values(ApplicationStatus),
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_document, returnedObject) => {
        const {
          _id,
          __v,
          applicantId,
          internshipId,
          ...application
        } = returnedObject;
        void __v;
        return {
          ...application,
          id: _id.toString(),
          applicantId: applicantId.toString(),
          internshipId: internshipId.toString(),
        };
      },
    },
  },
);

export const ApplicationModel = model("Application", applicationSchema);

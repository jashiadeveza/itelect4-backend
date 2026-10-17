import { model, Schema, type InferSchemaType } from "mongoose";

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
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_document, returnedObject) => {
        const { _id, __v, ...internship } = returnedObject;
        void __v;
        return { ...internship, id: _id.toString() };
      },
    },
  },
);

export type InternshipRecord = InferSchemaType<typeof internshipSchema>;
export const InternshipModel = model("Internship", internshipSchema);

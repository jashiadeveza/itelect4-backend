import { Router } from "express";
import { Types } from "mongoose";
import { InternshipModel } from "../models/Internship.js";
import { authenticate } from "../middleware/auth.js";
import type { InternshipCreateInput } from "../types/index.js";

export const internshipsRouter = Router();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseInternshipInput(value: unknown): InternshipCreateInput | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const { company, position, location, availableSlots } = value;
  if (
    typeof company !== "string" ||
    !company.trim() ||
    typeof position !== "string" ||
    !position.trim() ||
    typeof location !== "string" ||
    !location.trim() ||
    typeof availableSlots !== "number" ||
    !Number.isInteger(availableSlots) ||
    availableSlots < 0
  ) {
    return undefined;
  }

  return {
    company: company.trim(),
    position: position.trim(),
    location: location.trim(),
    availableSlots,
  };
}

internshipsRouter.get("/", async (_req, res) => {
  const internships = await InternshipModel.find().sort({ createdAt: -1 });
  res.json(internships);
});

internshipsRouter.get("/:id", async (req, res) => {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: "Invalid internship identifier" });
    return;
  }

  const internship = await InternshipModel.findById(req.params.id);
  if (!internship) {
    res.status(404).json({ message: "Internship not found" });
    return;
  }
  res.json(internship);
});

internshipsRouter.use(authenticate);

internshipsRouter.post("/", async (req, res) => {
  const input = parseInternshipInput(req.body);
  if (!input) {
    res.status(400).json({
      message:
        "Provide company, position, and location as non-empty strings, and availableSlots as a non-negative integer",
    });
    return;
  }

  const internship = await InternshipModel.create(input);
  res.status(201).json(internship);
});

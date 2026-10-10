import { Router } from "express";
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

internshipsRouter.use(authenticate);

internshipsRouter.get("/", async (_req, res) => {
  const internships = await InternshipModel.find().sort({ createdAt: -1 });
  res.json(internships);
});

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

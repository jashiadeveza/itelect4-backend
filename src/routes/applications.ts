import { Router, type Request, type Response } from "express";
import { ApplicationModel } from "../models/Application.js";
import { authenticate } from "../middleware/auth.js";
import {
  ApplicationStatus,
  type ApplicationCreateInput,
  type ApplicationStatusValue,
} from "../types/index.js";

export const applicationsRouter = Router();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isApplicationStatus(value: string): value is ApplicationStatusValue {
  return Object.values(ApplicationStatus).some((status) => status === value);
}

function getUserId(req: Request, res: Response): string | undefined {
  if (!req.userId) {
    res.status(401).json({ message: "Authentication is required" });
    return undefined;
  }
  return req.userId;
}

function parseApplicationInput(
  value: unknown,
  partial = false,
): Partial<ApplicationCreateInput> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const result: Partial<ApplicationCreateInput> = {};
  const fields = ["applicantId", "internshipId", "status"] as const;

  if (!partial && fields.some((field) => !(field in value))) {
    return undefined;
  }

  for (const field of fields) {
    if (!(field in value)) {
      continue;
    }

    const fieldValue = value[field];
    if (field === "status") {
      if (typeof fieldValue !== "string" || !isApplicationStatus(fieldValue)) {
        return undefined;
      }
      result.status = fieldValue;
      continue;
    }

    if (
      typeof fieldValue !== "number" ||
      !Number.isInteger(fieldValue) ||
      fieldValue < 1 ||
      fieldValue > 1_000_000
    ) {
      return undefined;
    }

    result[field] = fieldValue;
  }

  if (partial && Object.keys(result).length === 0) {
    return undefined;
  }

  return result;
}

applicationsRouter.use(authenticate);

applicationsRouter.get("/", async (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  const applications = await ApplicationModel.find({ userId }).sort({
    createdAt: -1,
  });
  res.json(applications);
});

applicationsRouter.get("/:id", async (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  const application = await ApplicationModel.findOne({
    _id: req.params.id,
    userId,
  });
  if (!application) {
    res.status(404).json({ message: "Application not found" });
    return;
  }
  res.json(application);
});

applicationsRouter.post("/", async (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  const input = parseApplicationInput(req.body);
  if (!input) {
    res.status(400).json({
      message:
        "Provide applicantId and internshipId from 1 to 1000000 and a valid application status",
    });
    return;
  }

  const application = await ApplicationModel.create({ ...input, userId });
  res.status(201).json(application);
});

applicationsRouter.put("/:id", async (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  const updates = parseApplicationInput(req.body, true);
  if (!updates) {
    res.status(400).json({ message: "Provide valid application fields to update" });
    return;
  }

  const application = await ApplicationModel.findOneAndUpdate(
    { _id: req.params.id, userId },
    { $set: updates },
    { new: true, runValidators: true },
  );
  if (!application) {
    res.status(404).json({ message: "Application not found" });
    return;
  }
  res.json(application);
});

applicationsRouter.delete("/:id", async (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  const application = await ApplicationModel.findOneAndDelete({
    _id: req.params.id,
    userId,
  });
  if (!application) {
    res.status(404).json({ message: "Application not found" });
    return;
  }
  res.json({ message: "Application deleted" });
});

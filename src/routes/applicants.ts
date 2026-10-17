import { Router, type Request, type Response } from "express";
import { Types } from "mongoose";
import { ApplicantModel } from "../models/Applicant.js";
import { authenticate } from "../middleware/auth.js";
import { Role, type ApplicantCreateInput } from "../types/index.js";

export const applicantsRouter = Router();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRole(value: unknown): value is ApplicantCreateInput["role"] {
  return Object.values(Role).some((role) => role === value);
}

function getUserId(req: Request, res: Response): string | undefined {
  if (!req.userId) {
    res.status(401).json({ message: "Authentication is required" });
    return undefined;
  }
  return req.userId;
}

function parseApplicantInput(value: unknown): ApplicantCreateInput | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  if (
    typeof value.name !== "string" ||
    !value.name.trim() ||
    typeof value.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim()) ||
    !isRole(value.role)
  ) {
    return undefined;
  }

  return {
    name: value.name.trim(),
    email: value.email.trim().toLowerCase(),
    role: value.role,
    isActive: typeof value.isActive === "boolean" ? value.isActive : true,
  };
}

applicantsRouter.use(authenticate);

applicantsRouter.get("/", async (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  res.json(await ApplicantModel.find({ userId }).sort({ createdAt: -1 }));
});

applicantsRouter.get("/:id", async (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: "Invalid applicant identifier" });
    return;
  }

  const applicant = await ApplicantModel.findOne({
    _id: req.params.id,
    userId,
  });
  if (!applicant) {
    res.status(404).json({ message: "Applicant not found" });
    return;
  }
  res.json(applicant);
});

applicantsRouter.post("/", async (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  const input = parseApplicantInput(req.body);
  if (!input) {
    res.status(400).json({
      message: "Provide a valid applicant name, email, and role",
    });
    return;
  }

  res.status(201).json(await ApplicantModel.create({ ...input, userId }));
});

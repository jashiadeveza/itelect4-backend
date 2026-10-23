import { Router, type Request, type Response } from "express";
import { rateLimit } from "express-rate-limit";
import { ApiError } from "@google/genai";
import {
  AiReplyError,
  recommendInternships,
  type InternshipOption,
} from "../ai/gemini.js";
import type { AiRecommendation } from "../types/index.js";
import { aiRequestSchema } from "../schemas/review.js";
import { ApplicantModel } from "../models/Applicant.js";
import { ApplicationModel } from "../models/Application.js";
import { InternshipModel } from "../models/Internship.js";
import { authenticate } from "../middleware/auth.js";

export const aiRouter = Router();

function getUserId(req: Request, res: Response): string | undefined {
  if (!req.userId) {
    res.status(401).json({ message: "Authentication is required" });
    return undefined;
  }
  return req.userId;
}

aiRouter.use(authenticate);

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  keyGenerator: (req: Request) => {
    if (!req.userId) {
      throw new Error("Authenticated user ID is required for AI rate limiting");
    }
    return req.userId;
  },
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Five internship recommendation requests a minute is the limit. Try again shortly.",
  },
});

aiRouter.use(aiLimiter);

aiRouter.post("/recommendations", async (req, res) => {
  const userId = getUserId(req, res);
  if (!userId) return;

  const parsedBody = aiRequestSchema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: parsedBody.error.issues.map((issue) => issue.message),
    });
    return;
  }
  const { applicantId } = parsedBody.data;

  const applicant = await ApplicantModel.findOne({ _id: applicantId, userId });
  if (!applicant) {
    res.status(404).json({ message: "Applicant not found" });
    return;
  }
  if (typeof applicant.role !== "string") {
    throw new Error("Applicant has an invalid role");
  }

  const availableInternships = await InternshipModel.find({
    availableSlots: { $gt: 0 },
  }).sort({ createdAt: -1 });
  const applications = await ApplicationModel.find({
    userId,
    applicantId,
    internshipId: {
      $in: availableInternships.map((internship) => internship.id),
    },
  }).select("internshipId");
  const appliedInternshipIds = new Set(
    applications.map((application) => application.internshipId),
  );
  const eligibleInternships = availableInternships.filter(
    (internship) => !appliedInternshipIds.has(internship.id),
  );
  const options: InternshipOption[] = eligibleInternships.map((internship) => {
    const { id, company, position, location, availableSlots } = internship;
    if (
      typeof id !== "string" ||
      typeof company !== "string" ||
      typeof position !== "string" ||
      typeof location !== "string" ||
      typeof availableSlots !== "number"
    ) {
      throw new Error("Internship record contains invalid recommendation data");
    }
    return { id, company, position, location, availableSlots };
  });

  let recommendations: AiRecommendation[];
  try {
    recommendations = await recommendInternships(applicant.role, options);
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      res.status(429).json({
        message: "The AI quota is used up for now. Try again later.",
      });
      return;
    }

    if (error instanceof ApiError || error instanceof AiReplyError) {
      console.error(error);
      res.status(502).json({
        message: "The AI service did not answer properly. Try again.",
      });
      return;
    }
    throw error;
  }
  const internshipsById = new Map(
    eligibleInternships.map((internship) => [internship.id, internship]),
  );

  res.json({
    recommendations: recommendations.map(({ internshipId, reason }) => {
      const internship = internshipsById.get(internshipId);
      if (!internship) {
        throw new Error("Gemini recommended an internship that is no longer available");
      }
      return { ...internship.toJSON(), reason };
    }),
  });
});

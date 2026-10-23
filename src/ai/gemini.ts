import { GoogleGenAI, type Content } from "@google/genai";
import {
  internshipRecommendationsJsonSchema,
  internshipRecommendationsSchema,
} from "../schemas/review.js";
import type { AiRecommendation } from "../types/index.js";
import { EXAMPLES, MODEL, SYSTEM_PROMPT, wrap } from "./prompt.js";

export interface InternshipOption {
  id: string;
  company: string;
  position: string;
  location: string;
  availableSlots: number;
}

export class AiReplyError extends Error {}

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Add it to .env, and to Vercel.",
    );
  }
  if (client === null) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

function buildContents(
  applicantRole: string,
  internships: InternshipOption[],
): Content[] {
  const shots: Content[] = EXAMPLES.flatMap((example) => [
    {
      role: "user",
      parts: [{ text: wrap(example.applicantRole, example.internships) }],
    },
    {
      role: "model",
      parts: [{ text: JSON.stringify(example.recommendations) }],
    },
  ]);

  return [
    ...shots,
    { role: "user", parts: [{ text: wrap(applicantRole, internships) }] },
  ];
}

export async function recommendInternships(
  applicantRole: string,
  internships: InternshipOption[],
): Promise<AiRecommendation[]> {
  if (internships.length === 0) {
    return [];
  }

  const options = internships.map(
    ({ id, company, position, location, availableSlots }) => ({
      id,
      company,
      position,
      location,
      availableSlots,
    }),
  );

  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: buildContents(applicantRole, options),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseJsonSchema: internshipRecommendationsJsonSchema,
    },
  });

  const text = response.text;
  if (!text) {
    throw new AiReplyError("Gemini sent back no text");
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new AiReplyError("Gemini's reply was not JSON");
  }

  const result = internshipRecommendationsSchema.safeParse(data);
  if (!result.success) {
    throw new AiReplyError("Gemini's reply did not match the recommendation schema");
  }

  const internshipIds = new Set(internships.map(({ id }) => id));
  const seenIds = new Set<string>();

  for (const recommendation of result.data.recommendations) {
    if (!internshipIds.has(recommendation.internshipId)) {
      throw new AiReplyError("Gemini recommended an internship that was not supplied");
    }
    if (seenIds.has(recommendation.internshipId)) {
      throw new AiReplyError("Gemini returned an invalid internship recommendation");
    }
    seenIds.add(recommendation.internshipId);
  }

  return result.data.recommendations.map(({ internshipId, reason }) => ({
    internshipId,
    reason: reason.trim(),
  }));
}
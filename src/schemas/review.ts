import { z } from "zod";

export const aiReviewRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(20, "Describe the applicant or internship in at least 20 characters")
    .max(2000, "Keep your description to 2000 characters or fewer"),
}).strict();

export const aiReviewReplySchema = z.object({
  summary: z.string().min(1).max(500),
  strengths: z.array(z.string().min(1).max(200)).max(5),
  improvementAreas: z.array(z.string().min(1).max(200)).max(5),
  recommendation: z.enum([
    "strong_match",
    "potential_match",
    "needs_more_information",
  ]),
}).strict();

export type AiReviewReply = z.infer<typeof aiReviewReplySchema>;

export const aiReviewReplyJsonSchema = z.toJSONSchema(aiReviewReplySchema);

export const aiRequestSchema = z.object({
  applicantId: z
    .string()
    .trim()
    .regex(/^[a-fA-F0-9]{24}$/, "Provide a valid applicantId"),
});

export type AiRequest = z.infer<typeof aiRequestSchema>;

export const internshipRecommendationsSchema = z.object({
  recommendations: z
    .array(
      z.object({
        internshipId: z
          .string()
          .describe("ID of an internship from the supplied available internships."),
        reason: z
          .string()
          .min(1)
          .max(300)
          .describe("A concise explanation of why this internship suits the applicant."),
      }).strict(),
    )
    .max(5)
    .describe("Internships ranked from the strongest fit to the weakest fit."),
}).strict();

export type InternshipRecommendations = z.infer<
  typeof internshipRecommendationsSchema
>;

export const internshipRecommendationsJsonSchema = z.toJSONSchema(
  internshipRecommendationsSchema,
);

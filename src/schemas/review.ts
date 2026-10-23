import { z } from "zod";

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

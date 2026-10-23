import "dotenv/config";

import { recommendInternships, type InternshipOption } from "./ai/gemini.js";

async function tryAi() {
  const internships: InternshipOption[] = [
    {
      id: "sample-internship-1",
      company: "Tech Solutions",
      position: "Software Development Intern",
      location: "Manila",
      availableSlots: 2,
    },
    {
      id: "sample-internship-2",
      company: "DataWorks",
      position: "Data Analytics Intern",
      location: "Quezon City",
      availableSlots: 1,
    },
  ];
  const recommendations = await recommendInternships("student", internships);

  console.log(JSON.stringify(recommendations, null, 2));
}

tryAi().catch((err: unknown) => {
  console.error("Gemini call failed:", err);
  process.exit(1);
});
import "dotenv/config";
import mongoose from "mongoose";
import { ensureDatabaseConnection } from "./middleware/connectDatabase.js";
import { InternshipModel } from "./models/Internship.js";
import { sampleInternships } from "./data/sampleInternships.js";

async function seed(): Promise<void> {
  try {
    await ensureDatabaseConnection();
    for (const internship of sampleInternships) {
      await InternshipModel.updateOne(
        { company: internship.company, position: internship.position },
        { $setOnInsert: internship },
        { upsert: true, runValidators: true },
      );
    }
    console.log(
      `Internship reference data is ready (${sampleInternships.length} sample entries).`,
    );
  } finally {
    await mongoose.disconnect();
  }
}

void seed().catch((error: unknown) => {
  console.error("Internship seed failed", error);
  process.exitCode = 1;
});

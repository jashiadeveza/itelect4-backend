import "dotenv/config";
import mongoose from "mongoose";
import { app } from "./app.js";

async function start(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  const jwtSecret = process.env.JWT_SECRET;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured; add your Atlas URI to .env");
  }
  if (
    !mongoUri.startsWith("mongodb://") &&
    !mongoUri.startsWith("mongodb+srv://")
  ) {
    throw new Error(
      "MONGODB_URI must be the complete connection string starting with mongodb+srv:// or mongodb://; copy it from Atlas > Connect > Drivers",
    );
  }
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
  }

  await mongoose.connect(mongoUri);
  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => {
    console.log(`Internship Tracker Backend listening on port ${port}`);
  });
}

void start().catch((error: unknown) => {
  console.error("Internship Tracker Backend startup failed", error);
  process.exitCode = 1;
});

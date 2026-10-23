import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { aiRouter } from "./routes/ai.js";
import { connectDatabase } from "./middleware/connectDatabase.js";
import { applicantsRouter } from "./routes/applicants.js";
import { applicationsRouter } from "./routes/applications.js";
import { authRouter } from "./routes/auth.js";
import { internshipsRouter } from "./routes/internships.js";

const configuredOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  ...configuredOrigins,
  "https://itelect4-project-eight.vercel.app",
  ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:5173"]),
]);

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.has(origin));
    },
  }),
);
app.use(express.json());
app.use("/api", connectDatabase);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    db: mongoose.connection.readyState === 1,
  });
});

app.use("/api/auth", authRouter);
app.use("/api/ai", aiRouter);
app.use("/api/applicants", applicantsRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/internships", internshipsRouter);

app.use((req, res) => {
  res.status(404).json({
    message: `No route for ${req.method} ${req.originalUrl}`,
  });
});

const handleError: ErrorRequestHandler = (error, _req, res, _next) => {
  void _next;
  if (
    error instanceof SyntaxError &&
    (("status" in error && error.status === 400) ||
      ("statusCode" in error && error.statusCode === 400))
  ) {
    res.status(400).json({ message: "Request body must be valid JSON" });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ message: error.message });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: "Invalid resource identifier" });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    res.status(409).json({ message: "An account with that email already exists" });
    return;
  }

  console.error("Request failed", error);
  res.status(500).json({ message: "An unexpected server error occurred" });
};

app.use(handleError);

export default app;

import type { RequestHandler } from "express";
import mongoose from "mongoose";

let connection: Promise<typeof mongoose> | null = null;

export async function ensureDatabaseConnection(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGODB_URI;
  if (
    !uri ||
    (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://"))
  ) {
    throw new Error(
      "MONGODB_URI must be configured with a MongoDB connection string",
    );
  }

  if (!connection) {
    connection = mongoose.connect(uri).catch((error: unknown) => {
      connection = null;
      throw error;
    });
  }

  await connection;
}

export const connectDatabase: RequestHandler = async (_req, _res, next) => {
  await ensureDatabaseConnection();
  next();
};

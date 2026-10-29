import type { NextFunction } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/middleware/connectDatabase.js", () => ({
  connectDatabase: (_req: unknown, _res: unknown, next: NextFunction) => next(),
}));

import app from "../src/app.js";

const jwtSecret = "test-only-jwt-secret";

describe("POST /api/ai authentication", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_SECRET", jwtSecret);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects requests without a token", async () => {
    const response = await request(app).post("/api/ai").send({});

    expect(response.status).toBe(401);
  });

  it("passes a valid token through authentication", async () => {
    const token = jwt.sign({}, jwtSecret, { subject: "test-user" });
    const response = await request(app)
      .post("/api/ai")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Enter between 20 and 2000 characters for the AI review.",
    );
  });
});

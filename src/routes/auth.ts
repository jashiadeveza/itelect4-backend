import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User.js";

export const authRouter = Router();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function createToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
  }

  return jwt.sign({}, secret, { subject: userId, expiresIn: "1h" });
}

authRouter.post("/register", async (req, res) => {
  const body: unknown = req.body;
  if (
    !isRecord(body) ||
    typeof body.email !== "string" ||
    typeof body.password !== "string" ||
    body.password.length < 8 ||
    body.password.length > 72
  ) {
    res.status(400).json({
      message: "Provide a valid email and a password between 8 and 72 characters",
    });
    return;
  }

  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await UserModel.create({
    email: body.email.trim().toLowerCase(),
    passwordHash,
  });

  res.status(201).json({
    token: createToken(user.id),
    user: { id: user.id, email: user.email },
  });
});

authRouter.post("/login", async (req, res) => {
  const body: unknown = req.body;
  if (
    !isRecord(body) ||
    typeof body.email !== "string" ||
    typeof body.password !== "string"
  ) {
    res.status(400).json({ message: "Provide an email and password" });
    return;
  }

  const user = await UserModel.findOne({
    email: body.email.trim().toLowerCase(),
  });
  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  res.json({
    token: createToken(user.id),
    user: { id: user.id, email: user.email },
  });
});

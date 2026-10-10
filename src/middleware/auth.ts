import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authenticate: RequestHandler = (req, res, next) => {
  const authorization = req.get("authorization");
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    res.status(401).json({ message: "A Bearer token is required" });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    next(new Error("JWT_SECRET is not configured"));
    return;
  }

  let payload: string | JwtPayload;
  try {
    payload = jwt.verify(match[1], secret);
  } catch {
    res.status(401).json({ message: "The Bearer token is invalid or expired" });
    return;
  }

  if (typeof payload === "string" || typeof payload.sub !== "string") {
    res.status(401).json({ message: "The Bearer token has no user identifier" });
    return;
  }

  req.userId = payload.sub;
  next();
};


import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      error: "Access denied. No session token provided.",
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT_SECRET is missing from the environment.");

    return res.status(500).json({
      error: "Server configuration error.",
    });
  }

  try {
    const decoded = jwt.verify(token, secret);

    req.user = decoded;

    return next();
  } catch (error) {
    return res.status(401).json({
      error: "Session expired or invalid. Please sign in again.",
    });
  }
}

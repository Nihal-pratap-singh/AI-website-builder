
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return secret;
}

// Create the JWT and store it in an HTTP-only cookie.
function setSessionCookie(res, payload) {
  const token = jwt.sign(payload, getJwtSecret(), {
    expiresIn: "30d",
  });

res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 30 * 24 * 60 * 60 * 1000,
});
}

// Register a new user.
export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: "Name, email, and password are required.",
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: trimmedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email already exists.",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: trimmedEmail,
      password,
    });

    setSessionCookie(res, {
      userId: user._id.toString(),
      email: user.email,
    });

    return res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(500).json({
      error: "Registration failed. Please try again.",
    });
  }
}

// Log in an existing user.
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: "Email and password are required.",
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: trimmedEmail,
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const isValid = await user.comparePassword(password);

    if (!isValid) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    setSessionCookie(res, {
      userId: user._id.toString(),
      email: user.email,
    });

    return res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      error: "Login failed. Please try again.",
    });
  }
}

// Log out by clearing the session cookie.
export function logout(_req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
  });

  return res.status(200).json({
    success: true,
  });
}

// Return the currently authenticated user.
export async function me(req, res) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        error: "Not authenticated.",
      });
    }

    const user = await User.findById(req.user.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Current user error:", error.message);

    return res.status(500).json({
      error: "Could not retrieve the current user.",
    });
  }
}

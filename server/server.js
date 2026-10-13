
import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectToDatabase } from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import projectRouter from "./routes/projectRoutes.js";

const app = express();

// 1. Configure allowed frontend origins
const allowedOrigins = (process.env.ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

// 2. Configure CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header (e.g. health checks).
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked origin: ${origin}`)
      );
    },
    credentials: true,
  })
);

// 3. Parse cookies and JSON before routes
app.use(cookieParser());
app.use(express.json());

// 4. Health-check endpoint
app.get("/", (_req, res) => {
  res.status(200).send("Server is Live!");
});

// 5. Temporary project authentication debugging
// Never log the actual JWT or cookie values.
app.use("/api/projects", (req, _res, next) => {
  console.log("Projects request:", req.method, req.originalUrl);
  console.log("Cookie header exists:", Boolean(req.headers.cookie));
  console.log("Parsed cookie names:", Object.keys(req.cookies || {}));
  console.log("Token found:", Boolean(req.cookies?.token));

  next();
});

// 6. API routes
app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);

// 7. Centralized error handler
app.use((err, _req, res, _next) => {
  console.error("[Error]", err.message);

  // CORS failures should not be reported as internal server errors.
  if (err.message.startsWith("CORS blocked origin:")) {
    return res.status(403).json({
      error: "Origin not allowed by CORS",
    });
  }

  return res.status(500).json({
    error: "Internal server error",
  });
});

// 8. Start server after connecting to the database
const startServer = async () => {
  try {
    await connectToDatabase();

    const port = process.env.PORT || 3000;

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log("Allowed frontend origins:", allowedOrigins);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

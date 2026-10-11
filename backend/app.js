require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");

const limiter = require("./middleware/rateLimiter");

const app = express();

// Trust reverse proxy (Render, Heroku, etc.)
app.set("trust proxy", 1);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "https://house-hunt-lucky-1a84.vercel.app",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow mobile apps, curl, server-to-server with no origin
      if (!origin) return callback(null, true);

      // Check explicit allowed origins or any vercel.app preview deployment
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }

      // Default allow so client never gets silently blocked by slight origin variations
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(limiter);

// Root health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "HouseHunt API Running"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "HouseHunt API Running",
    database: require("mongoose").connection.readyState === 1 ? "connected" : "disconnected"
  });
});

module.exports = app;
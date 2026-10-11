require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

// Connect database asynchronously
connectDB();

// Route modules
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const agreementRoutes = require("./routes/agreementRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const agentRoutes = require("./routes/agentRoutes");
const errorHandler = require("./middleware/errorHandler");

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/agreements", agreementRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/agents", agentRoutes);

// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

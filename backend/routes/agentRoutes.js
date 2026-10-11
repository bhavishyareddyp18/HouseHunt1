const express = require("express");
const router = express.Router();
const controller = require("../controllers/agentController");
const { protect } = require("../middleware/authMiddleware");

// Specific routes first
router.get("/dashboard", protect, controller.getDashboard);

// List all agents
router.get("/", controller.getAgents);

// Parameterized route last to prevent collision
router.get("/:id", controller.getAgentById);

module.exports = router;
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
// const authenticateToken = require("../middleware/authMiddleware");

// Ideally protect this route, but keeping it open for MVP/Anonymous as per current flow
// router.post("/", authenticateToken, chatController.chat);

router.post("/", chatController.chat);

module.exports = router;

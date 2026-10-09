const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { getChatHistory } = require("../controllers/chatController");

router.get("/history/:roomId", protect, getChatHistory);

module.exports = router;
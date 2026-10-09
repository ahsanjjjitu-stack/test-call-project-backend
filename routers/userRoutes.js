const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { getAllUsers } = require("../controllers/userController");
const router = express.Router();

router.get("/get_all_users", protect, getAllUsers);

module.exports = router;
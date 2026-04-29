const express = require("express");
const { register, login, getProfile } = require("../controllers/authController");
const auth = require("../middleware/auth");

const router = express.Router();

/* ================= AUTH ================= */
router.post("/register", register);
router.post("/login", login);

/* ================= USER ================= */
// 🔥 useful for frontend to get logged-in user
router.get("/me", auth, getProfile);

module.exports = router;
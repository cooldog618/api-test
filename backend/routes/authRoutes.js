const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { verifyAccessToken } = require("../middleware/authMiddleware");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.get("/me", verifyAccessToken, authController.me);
router.post("/logout", verifyAccessToken, authController.logout);

module.exports = router;
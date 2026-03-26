const express = require("express");
const router = express.Router();
const multer = require("multer");
const authController = require("../controllers/authController");
const { verifyAccessToken } = require("../middleware/authMiddleware");
const { generateJwt } = require("../controllers/jwtController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024, // 1MB
  },
});

router.post("/generate-jwt", upload.single("privateKeyFile"), generateJwt);

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.get("/me", verifyAccessToken, authController.me);
router.post("/logout", verifyAccessToken, authController.logout);

module.exports = router;
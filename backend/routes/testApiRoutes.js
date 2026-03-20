const express = require("express");
const router = express.Router();

const testApiController = require("../controllers/testApiController");
const { verifyGeneratedJwt } = require("../middleware/generatedJwtMiddleware");

router.get("/health", verifyGeneratedJwt, testApiController.getHealth);
router.get("/users", verifyGeneratedJwt, testApiController.getUsers);
router.get("/users/:userId", verifyGeneratedJwt, testApiController.getUserDetail);

router.post("/echo", verifyGeneratedJwt, testApiController.postEcho);
router.post("/calculate", verifyGeneratedJwt, testApiController.postCalculate);
router.post(
  "/profile/analyze",
  verifyGeneratedJwt,
  testApiController.postProfileAnalyze
);

module.exports = router;
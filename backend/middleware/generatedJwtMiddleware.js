const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const publicKeyPath = path.join(__dirname, "../keys/public_key.pem");
const PUBLIC_KEY = fs.readFileSync(publicKeyPath, "utf8");

exports.verifyGeneratedJwt = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "생성 JWT가 없습니다.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, PUBLIC_KEY, {
      algorithms: ["RS256"],
    });

    req.generatedUser = decoded;
    next();
  } catch (error) {
    console.error("verifyGeneratedJwt error:", error);

    return res.status(401).json({
      success: false,
      message: "유효하지 않은 생성 JWT입니다.",
    });
  }
};
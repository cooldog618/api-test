const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const publicKeyPath = path.join(__dirname, "../keys/public_key.pem");
const PUBLIC_KEY = fs.readFileSync(publicKeyPath, "utf8");

const normalizePem = (value = "") =>
  String(value)
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .trim();

exports.generateJwt = async (req, res) => {
  try {
    const { userID, role, tenantID, scope, expiresIn, typ, alg, kid } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Private Key 파일이 필요합니다.",
      });
    }

    if (!userID || !role || !tenantID) {
      return res.status(400).json({
        success: false,
        message: "userID, role, tenantID는 필수입니다.",
      });
    }

    const privateKeyPem = normalizePem(req.file.buffer.toString("utf8"));

    if (!privateKeyPem.startsWith("-----BEGIN PRIVATE KEY-----")) {
      return res.status(400).json({
        success: false,
        message: "PKCS#8 형식의 PRIVATE KEY 파일만 허용됩니다.",
      });
    }

    // 업로드한 private key가 서버 public key와 짝이 맞는지 검증
    const privateKeyObject = crypto.createPrivateKey({
      key: privateKeyPem,
      format: "pem",
    });

    const derivedPublicKeyPem = crypto
      .createPublicKey(privateKeyObject)
      .export({ type: "spki", format: "pem" });

    if (normalizePem(derivedPublicKeyPem) !== normalizePem(PUBLIC_KEY)) {
      return res.status(400).json({
        success: false,
        message: "업로드한 private key가 서버 public key와 일치하지 않습니다.",
      });
    }

    const payload = {
      userID,
      role,
      tenantID,
      scope: scope || "",
    };

    const header = {
      alg: "RS256",       // 고정
      typ: typ || "JWT",  // 입력 허용
    };

    if (kid) {
      header.kid = kid;
    }

    // alg는 프론트에서 보내도 실제로는 RS256만 허용
    if (alg && alg !== "RS256") {
      return res.status(400).json({
        success: false,
        message: "현재는 RS256만 지원합니다.",
      });
    }

    const token = jwt.sign(payload, privateKeyPem, {
      algorithm: "RS256",
      expiresIn: expiresIn || "2h",
      header,
    });

    return res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("generateJwt error:", error);
    return res.status(500).json({
      success: false,
      message: "JWT 생성 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
};
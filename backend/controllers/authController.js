const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AuthModel = require("../models/authModel");

const createAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
};

const createRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

exports.signup = async (req, res) => {
  try {
    const { email, password, name, role, tenantId } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        message: "email, password, name은 필수입니다.",
      });
    }

    const existingUser = await AuthModel.findByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        message: "이미 사용 중인 이메일입니다.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userId = await AuthModel.createUser({
      email,
      passwordHash,
      name,
      role,
      tenantId,
    });

    const user = await AuthModel.findById(userId);

    return res.status(201).json({
      message: "회원가입이 완료되었습니다.",
      user,
    });
  } catch (error) {
    console.error("signup error:", error);
    return res.status(500).json({
      message: "회원가입 중 오류가 발생했습니다.",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "email, password는 필수입니다.",
      });
    }

    const user = await AuthModel.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "비활성화된 계정입니다.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    await AuthModel.saveRefreshToken(user.id, refreshToken);

    return res.status(200).json({
      message: "로그인 성공",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenant_id,
      },
    });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({
      message: "로그인 중 오류가 발생했습니다.",
    });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        message: "리프레시 토큰이 없습니다.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        message: "유효하지 않은 리프레시 토큰입니다.",
      });
    }

    const user = await AuthModel.findByRefreshToken(refreshToken);

    if (!user || user.id !== decoded.id) {
      return res.status(401).json({
        message: "저장된 리프레시 토큰과 일치하지 않습니다.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "비활성화된 계정입니다.",
      });
    }

    const accessToken = createAccessToken(user);

    return res.status(200).json({
      message: "토큰 재발급 성공",
      accessToken,
    });
  } catch (error) {
    console.error("refresh error:", error);
    return res.status(500).json({
      message: "토큰 재발급 중 오류가 발생했습니다.",
    });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await AuthModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("me error:", error);
    return res.status(500).json({
      message: "사용자 조회 중 오류가 발생했습니다.",
    });
  }
};

exports.logout = async (req, res) => {
  try {
    await AuthModel.clearRefreshToken(req.user.id);

    return res.status(200).json({
      message: "로그아웃 되었습니다.",
    });
  } catch (error) {
    console.error("logout error:", error);
    return res.status(500).json({
      message: "로그아웃 중 오류가 발생했습니다.",
    });
  }
};
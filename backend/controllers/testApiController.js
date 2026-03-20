const sampleUsers = [
  {
    id: 1,
    name: "Jason",
    email: "jason@test.com",
    role: "admin",
    age: 33,
    status: "active",
  },
  {
    id: 2,
    name: "Alice",
    email: "alice@test.com",
    role: "tester",
    age: 28,
    status: "active",
  },
  {
    id: 3,
    name: "Bob",
    email: "bob@test.com",
    role: "viewer",
    age: 41,
    status: "inactive",
  },
];

exports.getHealth = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "테스트 API 서버가 정상 동작 중입니다.",
      serverTime: new Date().toISOString(),
      generatedJwtClaims: req.generatedUser,
    });
  } catch (error) {
    console.error("getHealth error:", error);
    return res.status(500).json({
      success: false,
      message: "health 조회 중 오류가 발생했습니다.",
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      count: sampleUsers.length,
      requestedBy: req.generatedUser?.userID || null,
      items: sampleUsers,
    });
  } catch (error) {
    console.error("getUsers error:", error);
    return res.status(500).json({
      success: false,
      message: "users 조회 중 오류가 발생했습니다.",
    });
  }
};

exports.getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = sampleUsers.find((item) => String(item.id) === String(userId));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "해당 사용자를 찾을 수 없습니다.",
      });
    }

    return res.status(200).json({
      success: true,
      item: {
        ...user,
        profile: {
          city: "Seoul",
          company: "ARK",
          interests: ["API", "JWT", "Testing"],
        },
      },
      generatedJwtClaims: req.generatedUser,
    });
  } catch (error) {
    console.error("getUserDetail error:", error);
    return res.status(500).json({
      success: false,
      message: "user detail 조회 중 오류가 발생했습니다.",
    });
  }
};

exports.postEcho = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "보낸 요청 body를 그대로 반환합니다.",
      receivedBody: req.body,
      generatedJwtClaims: req.generatedUser,
      receivedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("postEcho error:", error);
    return res.status(500).json({
      success: false,
      message: "echo 처리 중 오류가 발생했습니다.",
    });
  }
};

exports.postCalculate = async (req, res) => {
  try {
    const { a, b, operator } = req.body;

    if (typeof a !== "number" || typeof b !== "number" || !operator) {
      return res.status(400).json({
        success: false,
        message: "a, b는 number이고 operator는 필수입니다.",
      });
    }

    let result;

    switch (operator) {
      case "add":
        result = a + b;
        break;
      case "subtract":
        result = a - b;
        break;
      case "multiply":
        result = a * b;
        break;
      case "divide":
        if (b === 0) {
          return res.status(400).json({
            success: false,
            message: "0으로 나눌 수 없습니다.",
          });
        }
        result = a / b;
        break;
      default:
        return res.status(400).json({
          success: false,
          message:
            "operator는 add, subtract, multiply, divide 중 하나여야 합니다.",
        });
    }

    return res.status(200).json({
      success: true,
      input: { a, b, operator },
      result,
      generatedJwtClaims: req.generatedUser,
    });
  } catch (error) {
    console.error("postCalculate error:", error);
    return res.status(500).json({
      success: false,
      message: "calculate 처리 중 오류가 발생했습니다.",
    });
  }
};

exports.postProfileAnalyze = async (req, res) => {
  try {
    const { name, age, score, interests } = req.body;

    if (!name || typeof age !== "number" || typeof score !== "number") {
      return res.status(400).json({
        success: false,
        message: "name, age(number), score(number)는 필수입니다.",
      });
    }

    let level = "C";
    let comment = "기본 등급입니다.";

    if (score >= 90) {
      level = "A";
      comment = "매우 우수한 프로필입니다.";
    } else if (score >= 75) {
      level = "B";
      comment = "양호한 프로필입니다.";
    }

    return res.status(200).json({
      success: true,
      summary: {
        name,
        age,
        level,
        comment,
        interests: Array.isArray(interests) ? interests : [],
      },
      generatedJwtClaims: req.generatedUser,
    });
  } catch (error) {
    console.error("postProfileAnalyze error:", error);
    return res.status(500).json({
      success: false,
      message: "profile analyze 처리 중 오류가 발생했습니다.",
    });
  }
};
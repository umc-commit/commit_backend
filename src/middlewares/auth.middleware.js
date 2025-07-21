import { verifyJwt } from "../jwt.config.js";

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        resultType: "FAIL",
        error: {
          errorCode: "AUTH001",
          reason: "인증 정보가 없습니다.",
          data: null
        },
        success: null
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyJwt(token);
    console.log("🔍 Decoded JWT in middleware:", decoded);

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      resultType: "FAIL",
      error: {
        errorCode: "AUTH002",
        reason: "유효하지 않은 토큰입니다.",
        data: null
      },
      success: null
    });
  }
};

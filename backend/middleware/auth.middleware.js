import jwt from "jsonwebtoken";
import User from "../models/User.js";

// =======================
// VERIFY TOKEN
// =======================
export const verifyToken = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "Token không hợp lệ" });
      }

      if (user.status === "blocked") {
        return res.status(403).json({
          message:
            "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.",
        });
      }

      req.user = user;
      next();
      return;
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Token hết hạn hoặc không hợp lệ" });
    }
  }

  return res
    .status(401)
    .json({ message: "Không có token, quyền truy cập bị từ chối" });
};

// =======================
// ADMIN CHECK
// =======================
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res
      .status(403)
      .json({ message: "Quyền truy cập bị từ chối! Chỉ dành cho Admin." });
  }
};

/* =================================================
   ALIAS EXPORT (CỨU TOÀN BỘ ROUTES CŨ)
   ================================================= */
export const protect = verifyToken;
export const admin = isAdmin;

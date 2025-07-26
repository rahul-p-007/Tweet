import { error } from "console";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken";
export const isAuthenticated = async (req: any, res: any, next: any) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized : No token provided",
      });
    }
    console.log("Cookies:", req.cookies);

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    console.log("JWT Secret:", process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({
        error: "Unauthorized : Invalid token",
      });
    }
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        error: "  User not found",
      });
    }
    req.user = user;
    next();
  } catch (error: any) {
    console.log("Error in isAuthenticated middleware", error.message);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

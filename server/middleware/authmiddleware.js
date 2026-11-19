import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please login first",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id || !decoded.role) {
      return res.status(401).json({
        message: "Invalid login token",
      });
    }

    // Store the logged-in user's details
    req.user = decoded;

    // Keep this for compatibility with existing code
    req.studentId = decoded.id;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Session expired. Please login again",
    });
  }
}

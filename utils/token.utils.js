import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "todo-list-jwt-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const createToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

const tokenUtils = { createToken, verifyToken };

export default tokenUtils;

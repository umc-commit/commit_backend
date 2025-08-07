import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const signJwt = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

export const verifyJwt = (token) =>
  jwt.verify(token, JWT_SECRET);

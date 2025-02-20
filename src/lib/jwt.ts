import { jwtVerify, SignJWT } from "jose";

const secretKey = process.env.JWT_SECRET_KEY || "default";
const secret = new TextEncoder().encode(secretKey);

type JWTPayload = {
  address: `0x${string}`;
};

type SignJWTPayload = {
  address: string;
};

// 生成 JWT
export async function generateToken(pyaload: JWTPayload) {
  const jwt = await new SignJWT(pyaload)
    .setProtectedHeader({ alg: "HS256" }) // 设置签名算法
    .setIssuedAt() // 签发时间
    .setExpirationTime("7d") // 过期时间
    .setIssuer("hares") // 签发方
    .sign(secret); // 使用密钥签名
  return jwt;
}

// 验证 JWT
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify<JWTPayload>(token, secret, {
      issuer: "hares", // 验证签发方
    });
    return payload;
  } catch (err: any) {
    console.error("Invalid token:", err.message);
    return null;
  }
}

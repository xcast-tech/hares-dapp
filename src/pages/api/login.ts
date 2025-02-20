import type { NextApiRequest, NextApiResponse } from "next";
import { loginSignText } from "@/lib/constant";
import { serialize } from "cookie";
import { recoverMessageAddress } from "viem";
import { generateToken } from "@/lib/jwt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { address, signature } = req.body;

    if (!address || !signature) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    try {
      const recoverAddress = await recoverMessageAddress({
        message: loginSignText,
        signature,
      }).then((d) => d.toString());

      if (recoverAddress.toLowerCase() !== address.toLowerCase()) {
        return res.status(401).json({ error: "Invalid signature" });
      }

      const jwtPayload = { address: address.toLowerCase() };
      const jwtToken = await generateToken(jwtPayload);
      res.setHeader("Set-Cookie", [
        serialize("hares-token", jwtToken, {
          httpOnly: true, // 使用更安全的 httpOnly 设置
          secure: !process.env.LOCAL, // Always use secure for cross-origin
          sameSite: process.env.LOCAL ? undefined : "none", // Required for cross-origin
          path: "/",
          expires: new Date(Date.now() + 7 * 24 * 3600 * 1000),
          maxAge: 60 * 60 * 24 * 7,
        }),
      ]);

      res.status(200).json({ code: 0, message: "Login successful" });
    } catch (error) {
      console.error("Signature verification failed:", error);
      res.status(500).json({ code: -1, error: "Internal server error" });
    }
  } else {
    res.status(405).json({ code: -1, error: "Method not allowed" });
  }
}

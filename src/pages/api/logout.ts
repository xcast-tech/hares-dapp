import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const cookiesToClear = ["hares-token"];

    const cookies = cookiesToClear.map((cookieName) =>
      serialize(cookieName, "", {
        httpOnly: true, // 使用更安全的 httpOnly 设置
        secure: !process.env.LOCAL, // Always use secure for cross-origin
        sameSite: process.env.LOCAL ? undefined : "none", // Required for cross-origin
        path: "/",
        expires: new Date(0), // 设置为过去的日期以清除 cookie
      })
    );

    res.setHeader("Set-Cookie", cookies);

    res.status(200).json({ code: 0, message: "Logout successful" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

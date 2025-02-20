import type { NextApiRequest, NextApiResponse } from "next";
import { generateToken, verifyToken } from "@/lib/jwt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.cookies["hares-token"] ?? "";
  // const token = req.cookies.get("hares-token")?.value ?? "";
  try {
    const { address } = (await verifyToken(token)) ?? {};
    return res.status(200).json({ code: 0, data: { address } });
  } catch (error) {
    return res.status(401).json({ code: 401, message: "Unauthorized" });
  }
}

import { put } from "@vercel/blob";
import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { verifyToken } from "@/lib/jwt";
import { nanoid } from "nanoid";

const generateUUID = () => {
  return crypto.randomUUID();
};

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "application/pdf": ".pdf",
  "text/plain": ".txt",
  "application/json": ".json",
};

const getExtensionFromMimeType = (mimeType: string | undefined): string => {
  if (!mimeType) return "";
  return MIME_TO_EXTENSION[mimeType] || "";
};

export const config = {
  api: {
    bodyParser: false, // 禁用默认解析器
  },
};

type Data = {
  code: number;
  error?: string;
  data?:
    | {
        url: string;
      }
    | string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ code: 405, error: "Method not allowed" });
  }

  const token = req.cookies["hares-token"] ?? "";
  const { address } = (await verifyToken(token)) ?? {};

  if (!address) {
    return res.status(401).json({ code: -1, data: "Unauthorized" });
  }

  try {
    // 读取请求体为 Buffer
    const buffer: Buffer = await new Promise((resolve, reject) => {
      const chunks: any[] = [];
      req.on("data", (chunk) => chunks.push(chunk)); // 收集数据块
      req.on("end", () => {
        resolve(Buffer.concat(chunks));
      }); // 拼接为完整 Buffer
      req.on("error", reject); // 捕获错误
    });

    // buffer to blob
    const bolb = new Blob([buffer], { type: "image/jpeg" });

    const contentType = req.headers["content-type"];
    const extension = getExtensionFromMimeType(contentType);

    const { url } = await put(`haresai/${nanoid()}${extension}`, bolb, {
      access: "public", // 设置为公开访问
    });

    return res.status(200).json({ code: 0, data: { url } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ code: 500, error: "Internal Server Error" });
  }
}

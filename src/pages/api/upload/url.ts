import { put } from "@vercel/blob";
import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { verifyToken } from "@/lib/jwt";
import { nanoid } from "nanoid";

type Data = {
  code: number;
  data?:
    | {
        url: string;
      }
    | string;
  error?: string;
};

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ code: -1, error: "Method not allowed" });
  }

  const token = req.cookies["hares-token"] ?? "";
  const { address } = (await verifyToken(token)) ?? {};

  if (!address) {
    return res.status(401).json({ code: -1, data: "Unauthorized" });
  }

  const { url: fileUrl } = req.body;
  if (!fileUrl) {
    return res.status(400).json({ code: -1, error: "URL is required" });
  }

  try {
    // Fetch file from URL
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch file");
    }

    const contentType = response.headers.get("content-type") || "";
    const extension = MIME_TO_EXTENSION[contentType] || ".unknown";
    const filename = `haresai/${nanoid()}${extension}`;

    // Convert response to buffer
    const buffer = await response.arrayBuffer();

    // Upload to Vercel Blob
    const { url } = await put(filename, buffer, {
      access: "public",
      contentType,
    });

    return res.status(200).json({
      code: 0,
      data: { url },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      code: -1,
      error: "Failed to upload file from URL",
    });
  }
}

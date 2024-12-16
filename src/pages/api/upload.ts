//@ts-nocheck
import formidable from "formidable";
import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { promises as fsPromises } from "fs";
import { NextApiRequest, NextApiResponse } from "next";
const { readFile: fsReadFile } = fsPromises;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({ multiples: false });

    const { files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req, (err: any, fields: any, files: any) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const file = files.file[0];
    const fileData = await fsReadFile(file.filepath);

    const suffix = file.originalFilename.split(".").pop();

    const { url } = await put(`haresai/${nanoid()}.${suffix}`, fileData, {
      contentType: file.mimetype,
      access: "public",
    });

    return res.status(200).json({ code: 0, data: { url } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Upload failed." });
  }
}

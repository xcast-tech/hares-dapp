import Compressor from "compressorjs";

export const compressFileToJpeg = async (file: File | Blob) => {
  return new Promise<File | Blob>((resolve, reject) => {
    new Compressor(file, {
      quality: 0.6,
      mimeType: "image/jpeg",

      // The compression process is asynchronous,
      // which means you have to access the `result` in the `success` hook function.
      success(result) {
        resolve(result);
      },
      error(err) {
        console.log(err.message);
        reject(err);
      },
    });
  });
};

export async function uploadImage(payload: {
  file?: File | Blob;
  url?: string;
}): Promise<{
  code: number;
  data: {
    url: string;
  };
  error: string;
} | null> {
  const { file, url } = payload;

  if (file) {
    const _file = await compressFileToJpeg(file);
    const arrayBuffer = await _file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const reconstructedBuffer = Buffer.from(uint8Array);
    const type = _file.type;
    return uploadImageByFile(reconstructedBuffer, type);
  }
  if (url) {
    return uploadImageByUrl(url);
  }
  return null;
}

export const uploadImageByUrl = async (url: string) => {
  return fetch(`/api/upload/url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  }).then((response) => response.json());
};

export const uploadImageByFile = async (
  buffer: Buffer,
  contentType: string
) => {
  return fetch(`/api/ipfs`, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
    },
    body: buffer, // 直接发送文件的二进制内容
  }).then((response) => response.json());
};

export const uploadMetadata = async (payload: {
  name: string;
  ticker: string;
  image: string;
  desc: string;
  website: string;
  twitter: string;
  telegram: string;
}): Promise<{
  code: number;
  data: {
    url: string;
  };
  error: string;
} | null> => {
  return fetch(`/api/ipfs-metadata`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).then((response) => response.json());
};

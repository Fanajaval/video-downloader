import axios from "axios";
import fs from "fs";
import path from "path";

const DOWNLOAD_DIR = path.join(
  process.cwd(),
  "downloads"
);

export async function downloadFile(
  url: string,
  filename: string,
  onProgress?: (progress: number) => void
): Promise<string> {

  if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, {
      recursive: true
    });
  }

  const safeFilename = filename.replace(
    /[<>:"/\\|?*]/g,
    "_"
  );

  const filePath = path.join(
    DOWNLOAD_DIR,
    safeFilename
  );

  const response = await axios.get(url, {
    responseType: "stream",
    timeout: 30000
  });

  const totalLength =
    Number(response.headers["content-length"]) || 0;

  let downloaded = 0;

  const writer = fs.createWriteStream(filePath);

  response.data.on("data", (chunk: Buffer) => {

    downloaded += chunk.length;

    if (totalLength > 0) {

      const progress = Math.round(
        (downloaded / totalLength) * 100
      );

      onProgress?.(progress);
    }
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {

    writer.on("finish", () => {
      onProgress?.(100);
      resolve(filePath);
    });

    writer.on("error", reject);
  });
}
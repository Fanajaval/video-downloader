import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const DOWNLOAD_DIR = path.join(
  process.cwd(),
  "downloads"
);

export async function downloadFile(
  url: string,
  filename: string,
  onProgress?: (progress: number) => void
): Promise<string> {

  if (!url || !url.startsWith("http")) {
    throw new Error("URL invalide");
  }

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

  console.log("Téléchargement :", url);

  return new Promise((resolve, reject) => {
    const ytdlp = process.env.YT_DLP_PATH || "yt-dlp";
    const args = [
      "--no-playlist",
      "--newline",
      "--no-progress",
      "--no-part",
      "--js-runtimes",
      "node",
      "-f",
      "bv*[ext=mp4]+ba[ext=m4a]/b",
      "--merge-output-format",
      "mp4",
      "-o",
      filePath,
      url
    ];
    const child = spawn(ytdlp, args, { windowsHide: true });
    let errorOutput = "";

    child.stdout.on("data", (chunk: Buffer) => {
      const match = chunk.toString().match(/(\d+(?:\.\d+)?)%/);

      if (match) {
        onProgress?.(Math.min(99, Math.round(Number(match[1]))));
      }
    });

    child.stderr.on("data", (chunk: Buffer) => {
      errorOutput += chunk.toString();
    });

    child.on("error", (error) => {
      reject(new Error(`yt-dlp est introuvable: ${error.message}`));
    });

    child.on("close", (code) => {
      if (code !== 0 || !fs.existsSync(filePath)) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        for (const temporaryFile of fs.readdirSync(DOWNLOAD_DIR)) {
          if (temporaryFile.startsWith(`${path.parse(safeFilename).name}.`)) {
            fs.unlinkSync(path.join(DOWNLOAD_DIR, temporaryFile));
          }
        }

        reject(new Error(errorOutput.trim() || "yt-dlp a échoué"));
        return;
      }

      onProgress?.(100);
      resolve(filePath);
    });
  });
}
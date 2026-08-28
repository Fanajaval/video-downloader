"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFile = downloadFile;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const DOWNLOAD_DIR = path_1.default.join(process.cwd(), "downloads");
async function downloadFile(url, filename, onProgress) {
    if (!url || !url.startsWith("http")) {
        throw new Error("URL invalide");
    }
    if (!fs_1.default.existsSync(DOWNLOAD_DIR)) {
        fs_1.default.mkdirSync(DOWNLOAD_DIR, {
            recursive: true
        });
    }
    const safeFilename = filename.replace(/[<>:"/\\|?*]/g, "_");
    const filePath = path_1.default.join(DOWNLOAD_DIR, safeFilename);
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
        const child = (0, child_process_1.spawn)(ytdlp, args, { windowsHide: true });
        let errorOutput = "";
        child.stdout.on("data", (chunk) => {
            const match = chunk.toString().match(/(\d+(?:\.\d+)?)%/);
            if (match) {
                onProgress?.(Math.min(99, Math.round(Number(match[1]))));
            }
        });
        child.stderr.on("data", (chunk) => {
            errorOutput += chunk.toString();
        });
        child.on("error", (error) => {
            reject(new Error(`yt-dlp est introuvable: ${error.message}`));
        });
        child.on("close", (code) => {
            if (code !== 0 || !fs_1.default.existsSync(filePath)) {
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                }
                for (const temporaryFile of fs_1.default.readdirSync(DOWNLOAD_DIR)) {
                    if (temporaryFile.startsWith(`${path_1.default.parse(safeFilename).name}.`)) {
                        fs_1.default.unlinkSync(path_1.default.join(DOWNLOAD_DIR, temporaryFile));
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

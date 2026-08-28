import express from "express";
import cors from "cors";
import { downloadFile } from "./downloader.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Video Downloader API is running"
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    status: "ok"
  });
});

app.post("/api/download", async (req, res) => {
  try {
    const { url, filename } = req.body;

    if (!url || !filename) {
      return res.status(400).json({
        success: false,
        message: "url et filename sont obligatoires"
      });
    }

    const filePath = await downloadFile(url, filename);

    res.json({
      success: true,
      message: "Téléchargement terminé",
      file: filePath
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Erreur pendant le téléchargement"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
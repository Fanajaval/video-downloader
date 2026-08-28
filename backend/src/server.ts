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

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "L'URL est obligatoire"
      });
    }

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: "Le nom du fichier est obligatoire"
      });
    }

    if (
      typeof url !== "string" ||
      typeof filename !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Données invalides"
      });
    }

    const filePath = await downloadFile(
      url,
      filename
    );

    return res.json({
      success: true,
      message: "Téléchargement terminé",
      file: filePath
    });

  } catch (error) {

    console.error("Erreur téléchargement :", error);

    return res.status(500).json({
      success: false,
      message: "Impossible de télécharger le fichier"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
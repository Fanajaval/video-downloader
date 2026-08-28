import express from "express";
import cors from "cors";
import { downloadFile } from "./downloader.js";
import { createJob, getJob, updateJob } from "./jobs.js";


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
        message: "L'URL et le nom du fichier sont obligatoires"
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

    const job = createJob(url, filename);

    res.status(202).json({
      success: true,
      jobId: job.id,
      status: job.status
    });

    updateJob(job.id, {
      status: "downloading"
    });

    try {
      const filePath = await downloadFile(
        job.url,
        job.filename,
        (progress) => {
          updateJob(job.id, {
            progress
          });
        }
      );

      updateJob(job.id, {
        status: "completed",
        progress: 100,
        filePath
      });

    } catch (error) {

      console.error("Erreur téléchargement :", error);

      updateJob(job.id, {
        status: "error",
        error: error instanceof Error
          ? error.message
          : "Impossible de télécharger le fichier"
      });
    }

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Erreur du serveur"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/api/download/:jobId", (req, res) => {

  const job = getJob(req.params.jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Téléchargement introuvable"
    });
  }

  return res.json({
    success: true,
    job
  });
});

app.get("/api/download/:jobId/file", (req, res) => {
  const job = getJob(req.params.jobId);

  if (!job || job.status !== "completed" || !job.filePath) {
    return res.status(404).json({
      success: false,
      message: "Fichier non disponible"
    });
  }

  return res.download(job.filePath, job.filename);
});
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const downloader_js_1 = require("./downloader.js");
const jobs_js_1 = require("./jobs.js");
const app = (0, express_1.default)();
const PORT = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
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
        if (typeof url !== "string" ||
            typeof filename !== "string") {
            return res.status(400).json({
                success: false,
                message: "Données invalides"
            });
        }
        const job = (0, jobs_js_1.createJob)(url, filename);
        res.status(202).json({
            success: true,
            jobId: job.id,
            status: job.status
        });
        (0, jobs_js_1.updateJob)(job.id, {
            status: "downloading"
        });
        try {
            const filePath = await (0, downloader_js_1.downloadFile)(job.url, job.filename, (progress) => {
                (0, jobs_js_1.updateJob)(job.id, {
                    progress
                });
            });
            (0, jobs_js_1.updateJob)(job.id, {
                status: "completed",
                progress: 100,
                filePath
            });
        }
        catch (error) {
            console.error("Erreur téléchargement :", error);
            (0, jobs_js_1.updateJob)(job.id, {
                status: "error",
                error: error instanceof Error
                    ? error.message
                    : "Impossible de télécharger le fichier"
            });
        }
    }
    catch (error) {
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
    const job = (0, jobs_js_1.getJob)(req.params.jobId);
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
    const job = (0, jobs_js_1.getJob)(req.params.jobId);
    if (!job || job.status !== "completed" || !job.filePath) {
        return res.status(404).json({
            success: false,
            message: "Fichier non disponible"
        });
    }
    return res.download(job.filePath, job.filename);
});

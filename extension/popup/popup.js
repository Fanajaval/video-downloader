const downloadBtn = document.getElementById("downloadBtn");
const status = document.getElementById("status");

const videoTitle = document.getElementById("videoTitle");
const videoUrl = document.getElementById("videoUrl");

const progressContainer =
  document.getElementById("progressContainer");

const progressFill =
  document.getElementById("progressFill");

const progressText =
  document.getElementById("progressText");

const progressStatus =
  document.getElementById("progressStatus");

let videoInfo = null;

async function getVideoInfo() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    if (!tab.id || !tab.url?.includes("youtube.com/watch")) {
      videoTitle.textContent = "Aucune vidéo détectée";
      videoUrl.textContent = "-";

      status.textContent =
        "Ouvre une page vidéo YouTube.";

      downloadBtn.disabled = true;

      return;
    }

    const response = await chrome.tabs.sendMessage(
      tab.id,
      {
        type: "GET_VIDEO_INFO"
      }
    );

    if (!response?.success) {
      throw new Error(
        "Impossible de récupérer les informations."
      );
    }

    videoInfo = response.video;

    videoTitle.textContent = videoInfo.title;
    videoUrl.textContent = videoInfo.url;

    status.textContent = "Vidéo détectée";

    downloadBtn.disabled = false;

  } catch (error) {

    console.error(error);

    videoTitle.textContent = "Erreur";
    videoUrl.textContent = "-";

    status.textContent =
      "Impossible de communiquer avec la page.";

    downloadBtn.disabled = true;
  }
}


async function startDownload() {

  if (!videoInfo) {
    return;
  }

  downloadBtn.disabled = true;

  progressFill.style.width = "0%";
  progressText.textContent = "0%";
  progressStatus.textContent = "Préparation";

  status.textContent =
    "Préparation du téléchargement...";

  try {

    /*
     * Création du job
     */

    const response = await fetch(
      "http://localhost:3000/api/download",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          url: videoInfo.url,
          filename: `${videoInfo.title}.mp4`
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Erreur du serveur"
      );
    }

    const jobId = data.jobId;

    if (!jobId) {
      throw new Error(
        "Le serveur n'a pas retourné de jobId."
      );
    }

    status.textContent =
      "Téléchargement en cours...";

    /*
     * Surveillance du job
     */

    await monitorDownload(jobId);

  } catch (error) {

    console.error(error);

    progressStatus.textContent = "Erreur";

    status.textContent =
      error instanceof Error
        ? error.message
        : "Erreur de téléchargement";

    downloadBtn.disabled = false;
  }
}


async function monitorDownload(jobId) {

  const interval = setInterval(async () => {

    try {

      const response = await fetch(
        `http://localhost:3000/api/download/${jobId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erreur du serveur"
        );
      }

      const job = data.job;

      /*
       * Mise à jour de la progression
       */

      const progress = job.progress ?? 0;

      progressFill.style.width =
        `${progress}%`;

      progressText.textContent =
        `${progress}%`;

      /*
       * Gestion des états
       */

      if (job.status === "pending") {

        progressStatus.textContent =
          "En attente";

      } else if (job.status === "downloading") {

        progressStatus.textContent =
          "Téléchargement";

      } else if (job.status === "completed") {

        clearInterval(interval);

        progressFill.style.width = "100%";
        progressText.textContent = "100%";

        progressStatus.textContent =
          "Terminé";

        status.textContent =
          "Téléchargement terminé !";

        downloadBtn.disabled = false;

      } else if (job.status === "error") {

        clearInterval(interval);

        progressStatus.textContent =
          "Erreur";

        status.textContent =
          job.error || "Erreur de téléchargement";

        downloadBtn.disabled = false;
      }

    } catch (error) {

      console.error(
        "Erreur de surveillance :",
        error
      );

      clearInterval(interval);

      progressStatus.textContent =
        "Erreur";

      status.textContent =
        "Impossible de contacter le serveur.";

      downloadBtn.disabled = false;
    }

  }, 1000);
}


downloadBtn.addEventListener(
  "click",
  startDownload
);


getVideoInfo();
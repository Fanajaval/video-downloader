const downloadBtn = document.getElementById("downloadBtn");
const status = document.getElementById("status");

let videoInfo = null;

async function getVideoInfo() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    if (!tab.id || !tab.url?.includes("youtube.com/watch")) {
      status.textContent = "Aucune vidéo YouTube détectée.";
      return;
    }

    const response = await chrome.tabs.sendMessage(
      tab.id,
      {
        type: "GET_VIDEO_INFO"
      }
    );

    if (!response?.success) {
      status.textContent = "Impossible de récupérer la vidéo.";
      return;
    }

    videoInfo = response.video;

    status.textContent = videoInfo.title;

    downloadBtn.disabled = false;

  } catch (error) {
    console.error("Erreur :", error);

    status.textContent =
      "Impossible de communiquer avec la page.";
  }
}

downloadBtn.addEventListener("click", async () => {
  if (!videoInfo) {
    return;
  }

  status.textContent = "Connexion au serveur...";

  try {
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

    status.textContent = "Téléchargement terminé !";

    console.log(data);

  } catch (error) {
    console.error("Erreur :", error);

    status.textContent =
      error instanceof Error
        ? error.message
        : "Erreur de téléchargement";
  }
});

getVideoInfo();
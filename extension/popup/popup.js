const downloadBtn = document.getElementById("downloadBtn");
const status = document.getElementById("status");

downloadBtn.addEventListener("click", async () => {
  status.textContent = "Connexion au serveur...";

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    const response = await fetch("http://localhost:3000/api/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: tab.url,
        filename: "video-test.mp4"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erreur du serveur");
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
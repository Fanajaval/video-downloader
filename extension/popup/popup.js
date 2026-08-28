const downloadBtn = document.getElementById("downloadBtn");
const status = document.getElementById("status");

downloadBtn.addEventListener("click", async () => {
  status.textContent = "Téléchargement en cours...";

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    console.log("URL actuelle :", tab.url);

    status.textContent = "URL récupérée !";
  } catch (error) {
    console.error(error);
    status.textContent = "Une erreur est survenue.";
  }
});
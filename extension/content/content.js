console.log("Video Downloader : page vidéo détectée");

function getVideoInfo() {
  const title = document.title.replace(" - YouTube", "").trim();

  return {
    title,
    url: window.location.href
  };
}

console.log("Informations vidéo :", getVideoInfo());
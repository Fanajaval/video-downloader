# video-downloader

## Démarrage

Le backend utilise `yt-dlp` pour extraire les flux YouTube. `yt-dlp` doit être
accessible dans le PATH, ou son chemin peut être défini avec `YT_DLP_PATH`.

Pour les vidéos qui nécessitent la fusion de flux, installez également `ffmpeg`.

```powershell
cd backend
npm install
npm run build
npm start
```
import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDev = process.env.ELECTRON_DEV === "true";

function createWindow() {
  const win = new BrowserWindow({
    width: 360,
    minWidth: 360,

    height: 720,
    minHeight: 400,

    resizable: true,
    frame: true, // controllbar win
    backgroundColor: "#FFFFFF",

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.removeMenu(); // 상단 app-menu 제거

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

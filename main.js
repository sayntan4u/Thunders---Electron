const { app, BrowserWindow } = require("electron");
const server = require("./app");
const fs = require("fs");

let mainWindow;

// //Setup directories
var dir = ['./backup', './legal', './uploads'];

dir.forEach(function (currentValue, index, arr) {
  if (!fs.existsSync(currentValue)) {
    fs.mkdirSync(currentValue);
  }
});
 
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.maximize();
  mainWindow.setMenuBarVisibility(false);
 
  mainWindow.loadURL("http://localhost:8080");
  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}
 
app.on("ready", createWindow);
 
app.on("resize", function (e, x, y) {
  mainWindow.setSize(x, y);
});
 
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
 
app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});
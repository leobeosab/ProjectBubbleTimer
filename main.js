const {app, BrowserWindow, ipcMain, Tray, ipc} = require('electron');
const path = require('path');

const assetsDirectory = path.join(__dirname, 'assets');

let tray = undefined;
let window = undefined;

// Don't show the app in the doc
app.dock.hide()

app.on('ready', () => {
  createTray();
  createWindow();
});

const createTray = () => {
  tray = new Tray(path.join(assetsDirectory, 'img/icon.png'));
  tray.on('right-click', toggleWindow);
  tray.on('double-click', toggleWindow);
  tray.on('click', function (event) {
    if (window.isVisible()) {
      window.hide();
    } else {
      createWindow();
      showWindow();
    }
    // Show devtools when command clicked
    if (window.isVisible()) {
      window.openDevTools({mode: 'detach'});
    }
  });
}

const getWindowPosition = () => {
  const windowBounds = window.getBounds();
  const trayBounds = tray.getBounds();

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height);

  return {x: x, y: y};
}

const createWindow = () => {
  window = new BrowserWindow({
    width: 300,
    height: 450,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      // Prevents renderer process code from not running when window is
      // hidden
      backgroundThrottling: false
    }
  });
  window.loadURL(`file://${path.join(__dirname, 'index.html')}`);

  // Hide the window when it loses focus
  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide();
    }
  })
}

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide();
  } else {
    showWindow();
  }
}

const showWindow = () => {
  const position = getWindowPosition();
  window.setPosition(position.x, position.y, false);
  window.show();
  window.focus();
}

ipcMain.on('hide-window', function(event, arg) {
  window.hide();
});

ipcMain.on('show-window', () => {
  showWindow();
});
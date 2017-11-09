const {app, BrowserWindow, ipcMain, Menu, Tray} = require('electron');
const path = require('path');
const storage = require('electron-json-storage');

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
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: () => app.quit()
    },
    {
      label: 'Logout',
      click: () =>  {
        window.hide();
        storage.set("login", {}, (err) => console.log(err));
      }
    }
  ]);
  
  tray.setToolTip('PB Time Sheet');
  
  tray.on('right-click', () => tray.popUpContextMenu(contextMenu));
  tray.on('double-click', toggleWindow);
  tray.on('click', function (event) {
    if (window.isVisible()) {
      window.hide();
    } else {
      createWindow();
      showWindow();
    }
  });
};

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
};

ipcMain.on('hide-window', function(event, arg) {
  window.hide();
});

ipcMain.on('show-window', () => {
  showWindow();
});

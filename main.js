const path = require('path');
const url = require('url');
const electron = require('electron');
const logger = require('./src/utils/logger');
const usbPort = require('./src/utils/usbPort');
const { IS_RPI: isPi } = require('./src/constants');
const { app, BrowserWindow, ipcMain } = electron;

let win, usbPath;

const mode = process.env.NODE_ENV;

function reloadOnChange(win) {
  if (mode !== 'development') return { close: () => {} };

  const watcher = require('chokidar').watch(path.join(__dirname, 'dist', '**'), {
    ignoreInitial: true,
  });

  watcher.on('change', () => {
    win.reload();
  });

  return watcher;
}

function initPeripherals(win) {
  const serial = require(`./src/utils/serial`);
  usbPort.on('add', (path) => {
    usbPath = path;
    win.webContents.send('usbConnected');
  }).on('remove', () => {
    usbPath = void 0;
    win.webContents.send('usbDisconnected');
  });
  serial.subscribe((d) => win.webContents.send('serialData', d));
  ipcMain.on('startFileWrite', (_, ...args) => logger.createFile(...args));
  ipcMain.on('excelRow', (_, ...args) => logger.writeRow(...args));
  ipcMain.on('serialCommand', (_, ...args) => serial.sendCommand(...args));
  ipcMain.on('saveFile', () => logger.saveFile(usbPath));
  ipcMain.on('usbStorageRequest', usbPort.init);
  return {
    removeAllListeners() {
      usbPort.removeAllListeners();
      serial.unsubscribeAll();
    },
  };
}

function launch() {
  const screenArea = electron.screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({
    width: isPi ? screenArea.width : 1024,
    height: isPi ? screenArea.height : 600,
    fullscreen: isPi,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, './static/index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  const watcher = reloadOnChange(win);
  const peripherals = initPeripherals(win);

  win.on('closed', function() {
    peripherals.removeAllListeners();
    win = null;
    watcher.close();
  });
}

app.on('ready', launch);

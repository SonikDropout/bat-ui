const path = require('path');
const url = require('url');
const electron = require('electron');
const logger = require('./src/utils/logger');
const usbPort = require('./src/utils/usbPort');
const { IV_DATA, STATE_DATA, IS_RPI: isPi } = require('./src/constants');
const checkUpdate = require('./src/utils/updater');
const { app, BrowserWindow, ipcMain } = electron;

const mode = process.env.NODE_ENV;

let win,
  usbPath,
  updateAvailable,
  initialData = {
    iv: IV_DATA.map((k) => 0),
    state: STATE_DATA.map((k) => 0),
  };

function reloadOnChange(win) {
  if (mode !== 'development' && mode !== 'test') return { close: () => {} };

  const watcher = require('chokidar').watch(path.join(__dirname, 'app', '**'), {
    ignoreInitial: true,
  });

  watcher.on('change', () => {
    win.reload();
  });

  return watcher;
}

function initPeripherals(win) {
  const serial = require(`./src/utils/serial${isPi ? '' : '.mock'}`);
  usbPort
    .on('add', (path) => {
      usbPath = path;
      win.webContents.send('usbConnected');
    })
    .on('remove', () => {
      usbPath = void 0;
      win.webContents.send('usbDisconnected');
    });
  serial
    .on('data', (d) => win.webContents.send('serialData', d))
    .once('data', (d) => (initialData = d));
  initUpdater();
  ipcMain.on('startFileWrite', (_, ...args) => logger.createFile(...args));
  ipcMain.on('excelRow', (_, ...args) => logger.writeRow(...args));
  ipcMain.on('serialCommand', (_, ...args) => serial.sendCommand(...args));
  ipcMain.on('saveFile', (e) =>
    logger.saveFile(usbPath, () => e.reply('fileSaved'))
  );
  ipcMain.on('ejectUSB', usbPort.eject);
  ipcMain.on('usbStatusRequest', usbPort.init);
  ipcMain.on('initialDataRequest', (e) => (e.returnValue = initialData));
  return {
    removeAllListeners() {
      usbPort.removeAllListeners();
      serial.close();
    },
  };
}

function initUpdater() {
  checkUpdate().then((isUpdatable) => {
    if (isUpdatable) win.webContents.send('updateAvailable');
    updateAvailable = isUpdatable;
  });
  ipcMain.on('checkUpdate', (e) => (e.returnValue = updateAvailable));
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
      pathname: path.join(__dirname, 'app', 'index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  const watcher = reloadOnChange(win);
  const peripherals = initPeripherals(win);

  win.on('closed', function () {
    peripherals.removeAllListeners();
    win = null;
    watcher.close();
  });
}

app.on('ready', launch);

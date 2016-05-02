'use strict';

const app = require('app'),
      BrowserWindow = require('browser-window');

let mainWindow = null;

app.on('window-all-closed', () => {
  if (process.platform != 'darwin') app.quit();
});

app.on('ready', () => {
  const Screen = require('screen'),
        size = Screen.getPrimaryDisplay().size;
  mainWindow = new BrowserWindow({
    title: 'NicoCommentMover',
    left: 0,
    top: 0,
    width: size.width,
    height: size.height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false
  });
  // mainWindow.setIgnoreMouseEvents(true);
  mainWindow.maximize();
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.on('closed', () => mainWindow = null);
  mainWindow.openDevTools();
});

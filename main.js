'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var mainWindow = null;

app.on('window-all-closed', function() {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

app.on('ready', function() {
    var Screen = require('screen');
    var size = Screen.getPrimaryDisplay().size;
    mainWindow = new BrowserWindow({
        left: 0,
        top: 0,
        width: size.width,
        height: size.height,
        transparent: true,
        frame: false,
        alwaysOnTop: true
    });
    mainWindow.setIgnoreMouseEvents(true);
    mainWindow.maximize();
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.on('closed', function() {
        mainWindow = null;
    });
    // mainWindow.openDevTools();
});

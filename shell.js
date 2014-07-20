/* global process */

var app = require('app');
var ipc = require('ipc');
var BrowserWindow = require('browser-window');

var mainWindow = null;
var currentBounce = null;

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

function openMainWindow () {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 800,
        'min-width': 800,
        'min-height': 800
    });

    mainWindow.loadUrl('http://localhost:9000');

    mainWindow.toggleDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    mainWindow.on('focus', function () {
        if (currentBounce) {
            app.dock.cancelBounce(currentBounce);
            currentBounce = null;
        }
    });
}

app.on('ready', openMainWindow);

app.on('activate-with-no-open-windows', openMainWindow);

ipc.on('bounce-dock', function () {
    currentBounce = app.dock.bounce();
});

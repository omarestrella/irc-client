/* global process */

var app = require('app');
var BrowserWindow = require('browser-window');

var mainWindow = null;

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

function openMainWindow () {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 800,
        'min-width': 640,
        'min-height': 480
    });

    mainWindow.loadUrl('http://localhost:9000');

    mainWindow.toggleDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', openMainWindow);

app.on('activate-with-no-open-windows', openMainWindow);

app.commandLine.appendSwitch('enable-transparent-visuals');

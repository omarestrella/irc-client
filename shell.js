/* global process, __dirname */

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

    if (process.env['irc_development']) {
        mainWindow.loadUrl('http://localhost:9000');
        mainWindow.toggleDevTools();
    } else {
        mainWindow.loadUrl(__dirname + '/index.html');
    }


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

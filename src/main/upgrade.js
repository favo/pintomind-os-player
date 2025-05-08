const { rebootDevice, updateApp, updateFirmware, updateBleBridge, getSystemStats, setScreenRotation,
    setScreenResolution, getAllScreenResolution, readBluetoothID, turnDisplayOff, updateDisplayConfiguration, 
    setSettingsFromPlayerConfig, parseWiFiScanResults, sendDeviceInfoToMainWindow, setBluetoothID } = require("./utils");

const NetworkManager = require("./networkManager");
const BleManager = require("./bleManager");

const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");

const { store } = require("./store");
const { autoUpdater } = require("./autoUpdater");
const { setMainWindow, getWebContents, getMainWindow } = require('./windowManager');

const pjson = require("../../package.json");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");


app.commandLine.appendSwitch('gl', 'egl')
app.commandLine.appendSwitch('enable-gpu-rasterization');  // GPU for video rendering
app.commandLine.appendSwitch('ignore-gpu-blocklist');  // Enable all GPU features
app.commandLine.appendSwitch('enable-zero-copy');  // Efficient video frame handling
app.commandLine.appendSwitch('disable-software-video-decoder');  // Force hardware decoding
app.commandLine.appendSwitch('enable-native-gpu-memory-buffers');
app.commandLine.appendSwitch('disable-gpu-driver-bug-workarounds');

let systemStatsStream;

const createWindow = async () => {

    await setSettingsFromPlayerConfig()

    const mainWindow = new BrowserWindow({
        alwaysOnTop: false,
        backgroundColor: '#ffffff',
        width: 1920,
        height: 1080,
        frame: false,
        show: false, 
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "preload.js"),
        },
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.kiosk = true
        mainWindow.show()
    })

    mainWindow.loadFile(path.join(__dirname, "../renderer/upgrade/upgrade.html"))

    setMainWindow(mainWindow)

    mainWindow.on("closed", () => {
        setMainWindow(null);
    });

    upgrade();
};

app.on("ready", () => {
    createWindow();
});

app.on("window-all-closed", () => {
    app.exit(1);
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

async function upgrade(){

    // stoppe om en av kommandoene feiler
    // fjerne de servicene som er enablet, ble-bridge.service, bluetooth-power.service, pintomind-player.service
    // være sikker på at det vil fungere selv om filene ikke fins lengre.

    ///etc/xdg/systemd/user/pintomind-player.service
    ///home/pi/.config/systemd/user/default.target.wants

    // Install pintomind packages

    // curl -fsSL https://deb.pintomind.com/pubkey.asc | gpg --dearmor -o /etc/apt/keyrings/pintomind.gpg
    // echo "deb [arch=arm64  signed-by=/etc/apt/keyrings/pintomind.gpg] https://deb.pintomind.com stable main" > /etc/apt/sources.list.d/pintomind.list

    // apt-get update
    // apt-get install -y pintomind-player
    // reboot

}
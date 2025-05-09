const { setSettingsFromPlayerConfig } = require("./utils");


const { app, BrowserWindow  } = require("electron");

const { executeCommand } = require("./utils.js");
const { setMainWindow, getWebContents, getMainWindow } = require('./windowManager');

const path = require("path");

app.commandLine.appendSwitch('gl', 'egl')
app.commandLine.appendSwitch('enable-gpu-rasterization');  // GPU for video rendering
app.commandLine.appendSwitch('ignore-gpu-blocklist');  // Enable all GPU features
app.commandLine.appendSwitch('enable-zero-copy');  // Efficient video frame handling
app.commandLine.appendSwitch('disable-software-video-decoder');  // Force hardware decoding
app.commandLine.appendSwitch('enable-native-gpu-memory-buffers');
app.commandLine.appendSwitch('disable-gpu-driver-bug-workarounds');

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
    const command = "/home/pi/.upgrade.sh";
    await executeCommand(command);
}
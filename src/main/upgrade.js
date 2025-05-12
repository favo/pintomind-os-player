const { setSettingsFromPlayerConfig } = require("./utils");


const { app, BrowserWindow  } = require("electron");

const { executeCommand } = require("./utils.js");
const { setMainWindow } = require('./windowManager');

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
    console.log("==> Removing old services...");
    
    // Remove ble-bridge.service
    await executeCommand("sudo rm -f /etc/systemd/system/ble-bridge.service");
    await executeCommand("sudo rm -f /etc/systemd/system/multi-user.target.wants/ble-bridge.service");
    
    // Remove bluetooth-power.service 
    await executeCommand("sudo rm -f /etc/systemd/system/bluetooth-power.service");
    await executeCommand("sudo rm -f /etc/systemd/system/multi-user.target.wants/bluetooth-power.service");
    
    // Remove pintomind-player.service
    // await executeCommand("sudo rm -f /etc/systemd/user/pintomind-player.service");
    // await executeCommand("sudo rm -f /home/pi/.config/systemd/user/default.target.wants/pintomind-player.service");
    // await executeCommand("sudo rm -f /etc/xdg/systemd/user/pintomind-player.service");
    
    console.log("==> Installing Pintomind Player...");

    // Add Pintomind APT key and repository
    await executeCommand("sudo mkdir -p /etc/apt/keyrings");
    await executeCommand("curl -fsSL https://deb.pintomind.com/pubkey.asc | gpg --dearmor | sudo tee /etc/apt/keyrings/pintomind.gpg > /dev/null");
    
    await executeCommand("echo 'deb [arch=arm64 signed-by=/etc/apt/keyrings/pintomind.gpg] https://deb.pintomind.com stable main' | sudo tee /etc/apt/sources.list.d/pintomind.list");

    console.log("Update and install pintomind-player");
    
    await executeCommand("sudo apt-get update");
    await executeCommand("sudo apt-get full-upgrade -y");
    await executeCommand("sudo apt-get install -y pintomind-player");

    console.log("==> Setup complete. Rebooting...");
    await executeCommand("sudo reboot");
}
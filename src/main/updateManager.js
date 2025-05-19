const { logger } = require("./appsignal");
const { executeCommand, executeCommandStream } = require("./commandUtils.js");
const { getWebContents } = require('./windowManager');

class UpdateManager {

    static async getInstalledPackageVersions() {
        const command = "dpkg-query -W -f='${Package}: ${Version}\n' pintomind-ble-bridge pintomind-player pintomind-player-controller pintomind-player-runtime pintomind-plymouth-theme"

        const result = await executeCommand(command);
            
        if (result.success) {
            return result.stdout
        }
    }

    static runUpgrade(type) {
        switch (type) {
            case "system":
                UpdateManager.runSystemUpgrade()
                break;
            case "app":
                UpdateManager.runAppUpgrade()
                break;
            case "controller":
                UpdateManager.runPlayerControllerUpgrade()
                break;
            default:
                logger.logError("Invalid runUpgrade param:" + type,  "runUpgrade", "UpdateManager")
                break;
        }
    }

    static async runSystemUpgrade() {
        const command = "/opt/pintomind/runtime/system_upgrade";
        const webContents = getWebContents();
    
        webContents.send("open_toaster", "Running system upgrade...");
    
        const result = await executeCommandStream(command, "system_upgrade", (output) => {
            webContents.send("firmware_upgrade", output);
        });
    
        if (!result.success) {
            logger.logError(
                "Failed to update firmware: " + result.stderr + result.stdout,
                "runSystemUpgrade",
                "UpdateManager"
            );
            webContents.send("open_toaster", "System upgrade failed.");
        } else {
            webContents.send("open_toaster", "System upgrade completed. Rebooting...");
        }
    }
    

    static async runAppUpgrade() {
        const command = "/opt/pintomind/runtime/player_app_upgrade";
        const webContents = getWebContents();

        webContents.send("open_toaster", "Running player app upgrade...");

        const result = await executeCommandStream(command, "player_app_upgrade", (output) => {
            webContents.send("firmware_upgrade", output);
        });

        if (!result.success) {
            logger.logError(
                "Failed to update app: " + result.stderr + result.stdout,
                "runAppUpgrade",
                "UpdateManager"
            );
            webContents.send("open_toaster", "Player app upgrade failed.");
        } else {
            webContents.send("open_toaster", "Player app completed. Rebooting...");
        }
    }

    static async runPlayerControllerUpgrade() {
        const command = "/opt/pintomind/runtime/player_controller_upgrade";
        const webContents = getWebContents();

        webContents.send("open_toaster", "Running player controller upgrade...");

        const result = await executeCommandStream(command, "player_app_upgrade", (output) => {
            webContents.send("firmware_upgrade", output);
        });

        if (!result.success) {
            logger.logError(
                "Failed to player controller: " + result.stderr + result.stdout,
                "runPlayerControllerUpgrade",
                "UpdateManager"
            );
            webContents.send("open_toaster", "Player controller upgrade failed.");
        } else {
            webContents.send("open_toaster", "Player controller completed. Rebooting...");
        }
    }

}

module.exports = UpdateManager;
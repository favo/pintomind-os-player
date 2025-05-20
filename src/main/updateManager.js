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
            webContents.send("firmware_upgrade", {status: "inprogress", output: output});
        });
    
        if (!result.success) {
            logger.logError(
                "Failed to update firmware: " + result.stderr + result.stdout,
                "runSystemUpgrade",
                "UpdateManager"
            );
            webContents.send("firmware_upgrade", {status: "failed", output: result.stderr + result.stdout});
            webContents.send("open_toaster", "System upgrade failed.");
        } else {
            webContents.send("firmware_upgrade", {status: "finished"});
            webContents.send("open_toaster", "System upgrade completed. Rebooting...");
        }
    }

    static async runAppUpgrade() {
        const command = "/opt/pintomind/runtime/player_app_upgrade";
        const webContents = getWebContents();

        webContents.send("open_toaster", "Running player app upgrade...");

        const result = await executeCommandStream(command, "player_app_upgrade", (output) => {
            webContents.send("firmware_upgrade", {status: "inprogress", output: output});
        });

        if (!result.success) {
            logger.logError(
                "Failed to update app: " + result.stderr + result.stdout,
                "runAppUpgrade",
                "UpdateManager"
            );
            webContents.send("firmware_upgrade", {status: "failed", output: result.stderr + result.stdout});
            webContents.send("open_toaster", "Player app upgrade failed.");
        } else {
            webContents.send("firmware_upgrade", {status: "finished"});
            webContents.send("open_toaster", "Player app upgrade completed...");
        }
    }

    static async runPlayerControllerUpgrade() {
        const command = "/opt/pintomind/runtime/player_controller_upgrade";
        const webContents = getWebContents();

        webContents.send("open_toaster", "Running player controller upgrade...");

        const result = await executeCommandStream(command, "player_app_upgrade", (output) => {
            webContents.send("firmware_upgrade", {status: "inprogress", output: output});
        });

        if (!result.success) {
            logger.logError(
                "Failed to player controller: " + result.stderr + result.stdout,
                "runPlayerControllerUpgrade",
                "UpdateManager"
            );
            webContents.send("firmware_upgrade", {status: "failed", output: result.stderr + result.stdout});
            webContents.send("open_toaster", "Player controller upgrade failed.");
        } else {
            webContents.send("firmware_upgrade", {status: "finished"});
            webContents.send("open_toaster", "Player controller completed...");
        }
    }

}

module.exports = UpdateManager;
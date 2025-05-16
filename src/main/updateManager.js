const { logger } = require("./appsignal");
const { executeCommand } = require("./commandUtils.js");

class UpdateManager {

    static async getInstalledPackageVersions() {
        const command = "dpkg-query -W -f='${Package}: ${Version}\n' pintomind-ble-bridge pintomind-player pintomind-player-controller pintomind-player-runtime pintomind-plymouth-theme"

        const result = await executeCommand(command);

        if (result.success) {
            return result.stdout
        }
    }

    /**
     * Updates the device firmware by executing a system upgrade script.
     * 
     * Executes the firmware upgrade command located at `/opt/pintomind/runtime/system_upgrade`.
     * If the command executes successfully, the device is rebooted to apply the updates.
     *
     * @async
     * @returns {Promise<void>} Resolves when the firmware update process is complete.
     */
    static async runSystemUpgrade() {
        const command = "/opt/pintomind/runtime/system_upgrade";

        const result = await executeCommand(command);

        if (result.success) {
        } else {
            // TODO: Sende postmessage til butler om feil
            logger.logError("Failed to update firmware: " + result.stderr + result.stdout,  "runSystemUpgrade", "UpdateManager")
        }
    }

    static async runAppUpgrade() {
        const command = "/opt/pintomind/runtime/player_app_upgrade";

        const result = await executeCommand(command);

        if (result.success) {
        } else {
            logger.logError("Failed to update app: " + result.stderr + result.stdout,  "runAppUpdate", "UpdateManager")
        }
    }

    static async runPlayerControllerUpgrade() {
        const command = "/opt/pintomind/runtime/player_controller_upgrade";

        const result = await executeCommand(command);

        if (result.success) {
        } else {
            logger.logError("Failed to update player controller: " + result.stderr + result.stdout,  "runPlayerControllerUpgrade", "UpdateManager")
        }
    }

}

module.exports = UpdateManager;
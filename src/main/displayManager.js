const { executeCommand } = require("./utils.js");
const fs = require("fs");

class DisplayManager {

    async _executeCECCommand(command) {
        try {
            const result = await executeCommand(`echo "${command}" | cec-client -s -d 1`);
            console.log(`[CEC Command Output]:\n${result.stdout}`);
            return result.stdout;
        } catch (error) {
            console.error(`Failed to execute CEC command "${command}":`, error);
            throw error;
        }
    }

    async getDisplayPowerStatus() {
        console.log("Checking display power status...");
        const result = await this._executeCECCommand("pow 0");

        const match = result.match(/power status: (.+)/i);
        const powerStatus = match ? match[1].toLowerCase().trim() : "unknown";

        console.log(`Current display status: ${powerStatus}`);
        return powerStatus;
    }

    async turnDisplayOnViaCEC() {
        console.log("Turning display ON via CEC...");
        await this._executeCECCommand("on 0");
    }

    async turnDisplayOffViaCEC() {
        console.log("Turning display OFF (standby) via CEC...");
        await this._executeCECCommand("standby 0");
    }

    async turnDisplayOnViaScript() {
        console.log("Turning display ON via system script...");
        const command = "/opt/pintomind/runtime/apply_display_config";
        return await executeCommand(command);
    }

    async turnDisplayOffViaScript() {
        console.log("Turning display OFF via system script...");
        const command = "/opt/pintomind/runtime/turn_off_display";
        return await executeCommand(command);
    }

    async safeTurnOn() {
        console.log("Ensuring display is ON...");
        
        await this.turnDisplayOnViaScript();
        
        const status = await this.getDisplayPowerStatus();

        if (status === "on") {
            console.log("Display is already ON. ✅");
        } else if (status === "standby") {
            await this.turnDisplayOnViaCEC();
        }
    }

    async safeTurnOff() {
        console.log("Ensuring display is OFF...");

        const status = await this.getDisplayPowerStatus();

        if (status === "standby") {
            console.log("Display is already OFF (Standby). ✅");
        } else if (status === "on") {
            await this.turnDisplayOffViaCEC();
        }

        await this.turnDisplayOffViaScript();
    }


    /**
     * Updates the display configuration using a system script.
     * 
     * Executes the `/opt/pintomind/runtime/apply_display_config` script to adjust the video output settings
     * of the connected display. This command is executed asynchronously, and its result is returned.
     *
     * @async
     * @returns {Promise<object>}
     */
     async applyDisplayConfiguration() {
        const command = "/opt/pintomind/runtime/apply_display_config";

        return await executeCommand(command);
    }

    /**
     * Retrieves the current screen rotation value from the rotation file.
     * 
     * @async
     * @returns {Promise<string>} A promise that resolves to the rotation value read from the file, or an empty string if an error occurs.
     */
     async getScreenRotation() {
        try {
            return fs.readFileSync('./rotation', { encoding: 'utf8', flag: 'r' });
        } catch(error) {
            logger.logError(error,  "getScreenRotation", "utils")
            return "";
        }
    }

    /**
     * Sets the screen rotation by writing the rotation value to a file and updating the display configuration.
     * 
     * Valid rotation values are:
     * - "normal"
     * - "left"
     * - "right"
     * - "inverted"
     * 
     * If an invalid rotation value is provided, an error is thrown.
     *
     * @async
     * @param {string} rotation - The desired rotation value. Must be one of "normal", "left", "right", or "inverted".
     * @throws {Error} Throws an error if the rotation value is invalid.
     * @returns {Promise<void>} Resolves when the rotation is successfully set and the display configuration is updated.
     */
     static async setScreenRotation(rotation) {
        const validRotations = ["normal", "left", "right", "inverted"];

        try {
            if (!validRotations.includes(rotation)) {
                throw new Error(`Invalid rotation value: ${rotation}. Valid values are: ${validRotations.join(", ")}`);
            }

            fs.writeFileSync("./rotation", rotation);   
            
            await this.applyDisplayConfiguration()
        } catch(error) {
            logger.logError(error,  "setScreenRotation", "utils")
        }
    }

    /**
     * Sets the screen resolution by writing to the `resolution` file and updating the display configuration.
     * 
     * This function takes a resolution string, writes it to the `resolution` file, and then calls the
     * `applyDisplayConfiguration` function to apply the changes. If an error occurs during the process, 
     * the error is logged via AppSignal.
     * 
     * @async
     * @param {string} resolution The resolution to set (e.g., "1920x1080").
     * 
     * @returns {Promise<void>} A promise that resolves once the screen resolution has been set and 
     * the display configuration has been updated.
     * 
     * @throws {Error} If there is an error during the process (writing to file or updating the configuration),
     * the error is logged but not rethrown.
     */
     static async setScreenResolution(resolution) {
        try {
            fs.writeFileSync("./resolution", resolution);
            return await this.applyDisplayConfiguration()
        } catch(error) {
            logger.logError(error,  "setScreenResolution", "utils")
        }
    }

    /**
     * Retrieves all available screen resolutions and the current screen resolution along with rotation information.
     * 
     * This function uses the `xrandr` command to fetch a list of available screen resolutions. It also determines
     * the current screen resolution and retrieves the screen rotation. The output is returned as an object containing
     * a list of all available resolutions, the current resolution, and the current rotation state.
     * 
     * @async
     * @returns {Promise<object>} An object containing:
     *   - `list` {Array<string>|null}: A list of available screen resolutions (e.g., ["1920x1080", "1280x720"]). Returns `null` if there is an error or no available resolutions.
     *   - `current` {string|null}: The current screen resolution (e.g., "1920x1080"). Returns `null` if unable to determine the current resolution.
     *   - `rotation` {string|null}: The current screen rotation (e.g., "normal", "left", "right", "inverted"). Returns `null` if unable to retrieve the rotation.
     * 
     * @throws {Error} If the `xrandr` command fails or an error occurs while retrieving rotation information, a default object with `null` values will be returned.
     */
    static async getAllScreenResolution() {
        const command = "export DISPLAY=:0 | xrandr"
        const xrandrOutput = await executeCommand(command);
        const rotation = await this.getScreenRotation()

        if (xrandrOutput.success) {
            const resolutionPattern = /\b\d{3,4}x\d{3,4}\b/g;
            const currentResolutionPattern = /\b\d{3,4}x\d{3,4}\b(?=\s+\d+.\d+\*)/;

            return {
                list: xrandrOutput.stdout.match(resolutionPattern),
                current: xrandrOutput.stdout.match(currentResolutionPattern)[0],
                rotation: rotation
            };
        } else {
            return {
                list: null, 
                current: null,
                rotation: null
            }
        }

    }

}

module.exports = DisplayManager;
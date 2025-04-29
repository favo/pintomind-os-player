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
        const command = "/home/pi/.adjust_video.sh";
        return await executeCommand(command);
    }

    async turnDisplayOffViaScript() {
        console.log("Turning display OFF via system script...");
        const command = "/home/pi/.turn_off_display.sh";
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

}

module.exports = DisplayManager;

const { spawn } = require("child_process");
const { EventEmitter } = require("events");

class NmcliConnectionMonitor extends EventEmitter {

    async listenToJournal() {
        const journalctlCommand = ["-f", "_SYSTEMD_UNIT=NetworkManager.service"];

        this.journalctl = spawn("journalctl", journalctlCommand);
    
        this.journalctl.stdout.on("data", (data) => {
            const lines = data.toString().trim().split("\n");
            lines.forEach((line) => {
                console.log("New entry:",line);
                monitor.processLogEntry(line);
            });
        });
    
        this.journalctl.stderr.on("data", (data) => {
            console.error("Journalctl Error:", data.toString());
        });
    
        this.journalctl.on("error", (err) => {
            console.error("Failed to start journalctl:", err);
        });
    
        this.journalctl.on("close", (code) => {
            console.log(`Journalctl process exited with code ${code}`);
        });
    }

    killJournel() {
        if (this.journalctl) {
            this.journalctl.kill()
        }
    }

    processLogEntry(logEntry) {
        if (logEntry.includes("auto-activating connection")) {
            const { ssid, uuid } = this.extractSSIDAndUUID(logEntry)
            this.emit("connectionStarted", { ssid:  ssid, uuid: uuid});
        } else if (logEntry.includes("state change: disconnected -> prepare")) {
            this.emit("devicePreparing");
        } else if (logEntry.includes("access point") && logEntry.includes("secrets are required")) {
            this.emit("authenticationRequired");
        } else if (logEntry.includes("connection") && logEntry.includes("secrets exist")) {
            this.emit("authenticationSucceeded");
        } else if (logEntry.includes("supplicant interface state: 4way_handshake -> completed")) {
            this.emit("handshakeComplete");
        } else if (logEntry.includes("supplicant interface state: 4way_handshake -> disconnected")) {
            this.emit("handshakeDisconnected");
        } else if (logEntry.includes("Stage 2 of 5") && logEntry.includes("Connected to wireless network")) {
            this.emit("connectedToNetwork", { ssid: this.extractSSID(logEntry) });
        } else if (logEntry.includes("dhcp4") && logEntry.includes("new lease")) {
            const ip = this.extractIPAddress(logEntry);
            this.emit("ipAddressAcquired", { ip });
        } else if (logEntry.includes("Activation") && logEntry.includes("failed for connection")){
            this.emit("connectionFailed", { ssid: this.extractSSID(logEntry) });
        } else if (logEntry.includes("Activation: successful, device activated.")) {
            this.emit("connectionActivated");
        }
    }

    extractSSIDAndUUID(logEntry) {
        const regex = /connection '(.+?)' \((.+?)\)/;
        const match = logEntry.match(regex);
    
        if (match && match.length === 3) {
            const ssid = match[1];
            const uuid = match[2];
            return { ssid, uuid };
        }
    
        return null;
    }

    extractSSID(logEntry) {
        const match = logEntry.match(/network "([^"]+)"/);
        return match ? match[1] : null;
    }

    extractIPAddress(logEntry) {
        const match = logEntry.match(/address=([\d.]+)/);
        return match ? match[1] : null;
    }
}

const monitor = new NmcliConnectionMonitor();
exports.monitor = monitor;
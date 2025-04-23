const { spawn } = require("child_process");
const { EventEmitter } = require("events");

class DbusMonitorParser {
    constructor(emitter) {
        this.emitter = emitter;
        this.isStateChangedSignal = false
    }

    parse(line){
        line = line.trim();

        const isSignal = line.match(/^signal/)

        if (isSignal) {
            this.isStateChangedSignal = line.includes("interface=org.freedesktop.NetworkManager") && line.includes("member=StateChanged")
        }
        else if(this.isStateChangedSignal){
            const match = line.match(/uint32\s+(\d+)/);

            if(match){
                const statusCode = parseInt(match[1], 10);
                this.emitter.emit("stateChanged", statusCode);

                this.isStateChangedSignal = false
            }
        }
    }
}

class DbusMonitor extends EventEmitter {

    NM_STATE_UNKNOWN          = 0  // networking state is unknown
    NM_STATE_ASLEEP           = 10 // networking is not enabled
    NM_STATE_DISCONNECTED     = 20 // there is no active network connection
    NM_STATE_DISCONNECTING    = 30 // network connections are being cleaned up
    NM_STATE_CONNECTING       = 40 // a network connection is being started
    NM_STATE_CONNECTED_LOCAL  = 50 // there is only local IPv4 and/or IPv6 connectivity
    NM_STATE_CONNECTED_SITE   = 60 // there is only site-wide IPv4 and/or IPv6 connectivity
    NM_STATE_CONNECTED_GLOBAL = 70 // there is global IPv4 and/or IPv6 Internet connectivity

    init() {
        if (! this.dbusMonitor) {
            const dbusMonitorCommand = ["dbus-monitor", "--system", "interface='org.freedesktop.NetworkManager'"];

            const parser = new DbusMonitorParser(this)

            this.dbusMonitor = spawn("sudo", dbusMonitorCommand);

            this.dbusMonitor.stdout.on("data", (data) => {
                const lines = data.toString().trim().split("\n");
                lines.forEach(line => parser.parse(line))
            });
        
            this.dbusMonitor.stderr.on("data", (data) => {
                console.error("dbusMonitor Error:", data.toString());
            });
        
            this.dbusMonitor.on("error", (err) => {
                console.error("Failed to start dbusMonitor:", err);
            });
        
            this.dbusMonitor.on("close", (code) => {
                console.log(`dbusMonitor process exited with code ${code}`);
            });
        }
    }

    kill() {
        if (this.dbusMonitor) {
            this.dbusMonitor.kill()
            this.dbusMonitor = null
        }
    }
}

const dbusMonitor = new DbusMonitor();
exports.dbusMonitor = dbusMonitor;
exports.DbusMonitorParser = DbusMonitorParser
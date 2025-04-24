const pjson = require("../../package.json");
const Appsignal = require("@appsignal/javascript").default;
const { store } = require("./store");

class Logger {
    appsignal = null;

    setAppsignalKey(key){
        this.appsignal = new Appsignal({ key: key, revision: pjson.version });
    }

    logError(message, action, namespace, tags){
        console.error(`${namespace}:${action} - ${message}`)

        if(this.appsignal) {
            this.appsignal.sendError(message, (span) => {
                span.setAction(action);
                span.setNamespace(namespace);
                span.setTags(Object.assign(this.createTags(), tags || {}));
            });
        }
    }

    createTags(){
        const tags = {
            host: store.get("host")
        }

        const deviceInfo = store.get("deviceInfo")

        if(deviceInfo) {
            tags.bluetooth_id = deviceInfo['Bluetooth-ID']
        }

        return tags
    }
}

exports.logger = new Logger()
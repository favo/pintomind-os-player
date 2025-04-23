const { DbusMonitorParser } = require("../../src/main/dbusMonitor");


test("Should be able to emit statechanged event when handling expected signal", () => {
    const emitter = {
        emit: jest.fn()
    }

    const parser = new DbusMonitorParser(emitter)
    parser.parse("signal interface=org.freedesktop.NetworkManager member=StateChanged")
    parser.parse("    uint32 60")

    expect(emitter.emit).toHaveBeenCalledWith("stateChanged", 60)
})


test("Should be able to not emit statechanged event when handling another signal #1", () => {
    const emitter = {
        emit: jest.fn()
    }

    const parser = new DbusMonitorParser(emitter)
    parser.parse("signal interface=org.freedesktop.NetworkManager member=SomethingElse")
    parser.parse("    uint32 60")

    expect(emitter.emit).not.toBeCalled()
})


test("Should be able to not emit statechanged event when handling another signal #1", () => {
    const emitter = {
        emit: jest.fn()
    }

    const parser = new DbusMonitorParser(emitter)
    parser.parse("signal interface=org.freedesktop.DBus.Properties member=StateChanged")
    parser.parse("    uint32 60")

    expect(emitter.emit).not.toBeCalled()
})


test("Should be able to not emit statechanged event when handling another signal #2", () => {
    const emitter = {
        emit: jest.fn()
    }

    const parser = new DbusMonitorParser(emitter)
    parser.parse("    uint32 60")

    expect(emitter.emit).not.toBeCalled()
})
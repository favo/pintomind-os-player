const nodeChildProcess = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(nodeChildProcess.exec);
const { logger } = require("./appsignal");

/**
 * Executes a shell command asynchronously and returns the result.
 * 
 * Executes the specified command using an asynchronous process, capturing both
 * standard output (stdout) and standard error (stderr). If the command execution fails,
 * it logs the error using AppSignal and returns a failure result.
 *
 * @async
 * @param {string} command - The shell command to execute.
 * @param {string|null} [type=null] - An optional identifier for the command, used for logging purposes.
 * @returns {Promise<object>} A promise that resolves to an object containing:
 *   - `type` {string|null}: The command type or identifier.
 *   - `success` {boolean}: Indicates whether the command execution was successful.
 *   - `stdout` {string|null}: The trimmed standard output of the command, or `null` if execution failed.
 *   - `stderr` {string|null}: The trimmed standard error of the command, or `null` if execution failed.
 *   - `error` {Error|null}: The error object if execution failed, otherwise `null`.
 * 
 * @throws {Error} The error is logged using AppSignal but not rethrown.
 */
async function executeCommand(command, type = null) {
    try {
        const { stdout, stderr } = await execAsync(command);

        return {
            type: type,
            success: true,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
        };
    } catch (error) {
        logger.logError(error, type || "executeCommand", "utils")

        return {
            type: type,
            success: false,
            stdout: null,
            stderr: null,
            error: error,
        };
    }
}

module.exports = { executeCommand };

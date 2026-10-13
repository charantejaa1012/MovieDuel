/**
 * @fileoverview Structured Console Logger Utility.
 * Provides colorized timestamped logs for info, warn, error, and debug levels.
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const getTimestamp = () => new Date().toISOString();

/**
 * Formats structured log output.
 * @param {string} level - Log level name
 * @param {string} color - ANSI color code
 * @param {string} message - Primary log message
 * @param {any[]} args - Optional metadata or error objects
 */
function log(level, color, message, ...args) {
  const timestamp = getTimestamp();
  const prefix = `${colors.dim}[${timestamp}]${colors.reset} ${color}[${level.toUpperCase()}]${colors.reset}`;
  if (args.length > 0) {
    console.log(`${prefix} ${message}`, ...args);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

export const logger = {
  info: (message, ...args) => log('info', colors.cyan, message, ...args),
  warn: (message, ...args) => log('warn', colors.yellow, message, ...args),
  error: (message, ...args) => log('error', colors.red, message, ...args),
  debug: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      log('debug', colors.magenta, message, ...args);
    }
  },
  success: (message, ...args) => log('success', colors.green, message, ...args)
};

export default logger;

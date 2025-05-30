// stripeLogger.js
const winston = require('winston');
const moment = require('moment-timezone');

const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
  },
  colors: {
    fatal: 'magenta',
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    debug: 'blue',
  }
};

winston.addColors(customLevels.colors);

const stripeLogger = winston.createLogger({
  levels: customLevels.levels,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ level, message }) => {
      const timestamp = moment().tz('Europe/London').format('YYYY-MM-DD HH:mm:ss');
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/stripe.log' })
  ]
});

module.exports = stripeLogger;

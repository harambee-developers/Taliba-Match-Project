// logger.js
const winston = require('winston');

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
      info: 'green',
      debug: 'blue',
    }
  };
  winston.addColors(customLevels.colors);

  const logger = winston.createLogger({
    levels: customLevels.levels,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}]: ${message}`;
      })
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'logs/app.log' })
    ]
  });

module.exports = logger;

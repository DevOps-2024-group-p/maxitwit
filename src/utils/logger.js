const winston = require('winston')
const appRoot = require('app-root-path')
const ecsFormat = require('@elastic/ecs-winston-format')

const options = {
  infoFile: {
    level: 'info',
    filename: `${appRoot}/logs/info.json`,
    handleExceptions: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    format: ecsFormat({ convertReqRes: true })
  },
  errorFile: {
    level: 'error',
    filename: `${appRoot}/logs/error.json`,
    handleExceptions: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    format: ecsFormat({ convertReqRes: true })
  },
  httpFile: {
    level: 'http',
    filename: `${appRoot}/logs/http.json`,
    handleExceptions: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    format: ecsFormat({ convertReqRes: true })
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    format: ecsFormat({ convertReqRes: true })
  }
}

const logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.infoFile),
    new winston.transports.File(options.errorFile),
    new winston.transports.File(options.httpFile),
    new winston.transports.Console(options.console)
  ],
  exitOnError: false
})

logger.stream = {
  write: function (message, encoding) {
    logger.info(message)
  }
}

module.exports = logger

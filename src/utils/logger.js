const winston = require('winston')
const ecsFormat = require('@elastic/ecs-winston-format')

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
}

const level = () => {
  const env = process.env.NODE_ENV || 'development'
  const isDevelopment = env === 'development'
  return isDevelopment ? 'debug' : 'warn'
}

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
}

winston.addColors(colors)

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.json',
    level: 'error'
  }),
  new winston.transports.File({ filename: 'logs/all.json' })
]
const logger = winston.createLogger({
  level: level(),
  levels,
  format: ecsFormat({ convertReqRes: true }),
  transports
})
// In development, log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}
module.exports = logger

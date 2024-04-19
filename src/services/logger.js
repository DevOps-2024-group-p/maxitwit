const winston = require('winston')
const { createLogger, format } = winston
const FluentTransport = require('fluent-logger').support.winstonTransport()

// Create a Winston logger
const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new FluentTransport('info', {
      host: 'fluentd-host',
      port: 24224,
      timeout: 3.0,
      reconnectInterval: 600000 // 10 minutes
    })
  ]
})

module.exports = logger

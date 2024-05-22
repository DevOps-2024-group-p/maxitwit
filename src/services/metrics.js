const client = require('prom-client')

// Create a new Prometheus registry for tracking all metrics
const register = new client.Registry()

const httpErrorsCounter = new client.Counter({
  name: 'http_errors_total',
  help: 'Total HTTP errors'
})
register.registerMetric(httpErrorsCounter)

const httpRequestsCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests'
})
register.registerMetric(httpRequestsCounter)

const httpRequestDurationMilliseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500] // buckets for response time from 0.1ms to 500ms
})
register.registerMetric(httpRequestDurationMilliseconds)

module.exports = {
  httpErrorsCounter,
  httpRequestsCounter,
  httpRequestDurationMilliseconds,
  register
}

const client = require('prom-client')
const collectDefaultMetrics = client.collectDefaultMetrics
const Registry = client.Registry
const register = new Registry()
collectDefaultMetrics({ register })

const loginCounter = new client.Counter({
  name: 'login_endpoint_counter',
  help: 'Counter for public endpoint'

})

const publicCounter = new client.Counter({
  name: 'public_endpoint_counter',
  help: 'Counter for public endpoint'

})

const followCounter = new client.Counter({
  name: 'follow_endpoint_counter',
  help: 'Counter for public endpoint'

})

const unfollowCounter = new client.Counter({
  name: 'unfollow_endpoint_counter',
  help: 'Counter for public endpoint'

})

const registerCounter = new client.Counter({
  name: 'register_endpoint_counter',
  help: 'Counter for public endpoint'

})

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.10, 5, 15, 50, 100, 200, 300, 400, 500] // buckets for response time from 0.1ms to 500ms
})

/* use this in grafana:
    bar gauge grafana: avg by(route) (rate(http_request_duration_ms_sum[30s]) / rate(http_request_duration_ms_count[30s]))
    time series: avg(rate(http_request_duration_ms_sum[30s]) / rate(http_request_duration_ms_count[30s]))
 */

module.exports = {
  registerCounter,
  loginCounter,
  publicCounter,
  followCounter,
  unfollowCounter,
  httpRequestDurationMicroseconds
}

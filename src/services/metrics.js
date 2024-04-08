const client = require('prom-client')
const collectDefaultMetrics = client.collectDefaultMetrics
const Registry = client.Registry
const register = new Registry()

collectDefaultMetrics({ register })

const PUBLIC_COUNTER_HELP = 'Counter for public endpoint'
const HTTP_COUNTER_HELP = 'Counter for HTTP requests'
const loginCounter = new client.Counter({
  name: 'login_endpoint_counter',
  help: PUBLIC_COUNTER_HELP

})

const publicCounter = new client.Counter({
  name: 'public_endpoint_counter',
  help: PUBLIC_COUNTER_HELP

})

const followCounter = new client.Counter({
  name: 'follow_endpoint_counter',
  help: PUBLIC_COUNTER_HELP

})

const unfollowCounter = new client.Counter({
  name: 'unfollow_endpoint_counter',
  help: PUBLIC_COUNTER_HELP

})

const registerCounter = new client.Counter({
  name: 'register_endpoint_counter',
  help: PUBLIC_COUNTER_HELP

})

const httpRequestsCounter = new client.Counter({
  name: 'http_requests_counter',
  help: HTTP_COUNTER_HELP,
  labelNames: ['method', 'path']
})

const httpErrorsCounter = new client.Counter({
  name: 'http_errors_counter',
  help: HTTP_COUNTER_HELP,
  labelNames: ['status', 'method', 'path']
})

module.exports = {
  registerCounter,
  loginCounter,
  publicCounter,
  followCounter,
  unfollowCounter,
  httpErrorsCounter,
  httpRequestsCounter
}

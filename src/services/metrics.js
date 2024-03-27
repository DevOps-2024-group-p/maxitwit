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

const httpErrorsCounter = new client.Counter({
  name: 'http_errors_counter',
  help: 'Counter for HTTP errors'
})

module.exports = {
  registerCounter,
  loginCounter,
  publicCounter,
  followCounter,
  unfollowCounter,
  httpErrorsCounter
}

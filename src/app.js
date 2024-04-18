/**
 * This file is the main configuration and setup file for an Express web application.
 * It imports necessary modules, sets up middleware, defines routes, and configures error handling.
 * Express is a web application framework for Node.js, designed for building web applications and APIs.
 */

// Import necessary modules
require('dotenv').config() // Load environment variables from a .env file into process.env
const express = require('express') // The main Express framework
const path = require('path') // Core Node.js module to handle and transform file paths
const cookieParser = require('cookie-parser') // Middleware to parse and set cookies in request objects
const session = require('express-session') // Middleware to handle sessions
const SQLiteStore = require('connect-sqlite3')(session) // Session store using SQLite, using the session middleware
const flash = require('connect-flash') // Middleware for flash messages between requests

// Logging setup
const morgan = require('morgan') // Logging middleware for http requests
const logger = require('./services/logger.js') // Logger service for structured logging

// Import routers
const loginRouter = require('./routes/login') // Router for login related paths
const logoutRouter = require('./routes/logout') // Router for logout related paths
const registerRouter = require('./routes/register') // Router for register related paths
const timelineRouter = require('./routes/timeline') // Router for public timeline related paths
const apiRouter = require('./routes/api') // Router for api related paths

// Metrics services to monitor and count http requests and errors
const { httpErrorsCounter, httpRequestsCounter, httpRequestDurationMilliseconds, register } = require('./services/metrics.js')

// Initialize the Express application
const app = express()

app.set('views', path.join(__dirname, 'views')) // Specifies directory where the Pug template files are located
app.set('view engine', 'pug') // Sets Pug as the template engine

// Middleware for use in production environment
app.use(express.json()) // Parses incoming requests with JSON payloads, making it easy to handle JSON data
app.use(express.urlencoded({ extended: false })) // Parses incoming requests with URL-encoded payloads, useful for form submissions
app.use(cookieParser()) // Parse Cookie header and populate req.cookies with an object keyed by cookie names
app.use(express.static(path.join(__dirname, 'public'))) // Serve static files (images, CSS, JavaScript) from the 'public' directory

// Get session secret from .env
const { SESSION_SECRET } = process.env
if (!SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not set')
}

// Session middleware storing sessions in sessions.db
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    store: new SQLiteStore({
      dir: './db',
      db: 'sessions.db'
    }),
    secret: SESSION_SECRET,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 week
  })
)

// Flash middleware for flash messages
app.use(flash())

// Flash middlewhere to add flash messages to the response local variables
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success')
  res.locals.error_messages = req.flash('error')
  next()
})

// Morgan middleware to log http requests
app.use(morgan('combined', { stream: { write: message => logger.info(message) } }))

// Middleware to monitor http request duration, count and errors
app.use((req, res, next) => {
  const start = Date.now()
  const send = res.send
  res.send = function (string) {
    const duration = Date.now() - start
    httpRequestDurationMilliseconds.observe(duration)
    const body = string instanceof Buffer ? string.toString() : string
    httpRequestsCounter.inc()
    if (res.statusCode >= 400) {
      httpErrorsCounter.inc()
    }
    send.call(this, body)
  }
  next()
})

// Set routes conditionally for api or app
if (process.env.API) {
  app.use('/', apiRouter) // Use the API router for requests to '/api'
} else {
  app.use('/login', loginRouter) // Use the login router for requests to '/login'
  app.use('/logout', logoutRouter) // Use the logout router for requests to '/login'
  app.use('/register', registerRouter) // Use the register router for requests to '/register'
  app.use('/', timelineRouter) // Use the public timeline router for requests to '/'
}

// Error handler middleware
app.use((err, req, res, next) => {
  // Set locals, providing error details only in development environment
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  console.log(process.env.NODE_ENV)

  // Render the error page, setting the status code
  res.status(err.status || 500)
  res.render('error') // Use view engine to render the error page
})

// Define route for the '/metrics' endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType) // Set contentType of response to be compatible with Prometheus
  res.end(await register.metrics()) // End response and send the metrics
})

// Export the app for use by other modules
module.exports = app

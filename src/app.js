/**
 * This file is the main configuration and setup file for an Express web application.
 * It imports necessary modules, sets up middleware, defines routes, and configures error handling.
 * Express is a web application framework for Node.js, designed for building web applications and APIs.
 */

// Import necessary modules
require('dotenv').config()
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const flash = require('connect-flash')
const PgSession = require('connect-pg-simple')(session)
const { Pool } = require('pg')

// Import routers for different paths
const loginRouter = require('./routes/login')
const logoutRouter = require('./routes/logout')
const registerRouter = require('./routes/register')
const timelineRouter = require('./routes/timeline')
const apiRouter = require('./routes/api')

// Initialize the Express application
const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// Middleware setup
if (process.env.NODE_ENV === 'development') {
  const logger = require('morgan')
  app.use(logger('dev'))
}

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

const { SESSION_SECRET, DATABASE_URL } = process.env
if (!SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not set')
}

const pool = new Pool({
  connectionString: DATABASE_URL
})

app.use(session({
  store: new PgSession({
    pool, // Connection pool
    tableName: 'userSession'
  }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 week
}))

app.use(flash())
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success')
  res.locals.error_messages = req.flash('error')
  next()
})

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
  res.render('error') // Uses the view engine to render the error page
})

// Export the app for use by other modules (like the server starter script)
module.exports = app

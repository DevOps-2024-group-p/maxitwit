/**
 * This file is the main configuration and setup file for an Express web application.
 * It imports necessary modules, sets up middleware, defines routes, and configures error handling.
 * Express is a web application framework for Node.js, designed for building web applications and APIs.
 */

// Import necessary modules
const createError = require('http-errors'); // Module to create HTTP errors for Express, simplifies error handling
const express = require('express'); // The main Express framework
const path = require('path'); // Core Node.js module to handle and transform file paths
const cookieParser = require('cookie-parser'); // Middleware to parse and set cookies in request objects
const logger = require('morgan'); // HTTP request logger middleware for node.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/minitwit.db'); // todo This needs to be set up in an init function with error handling instead

// Import routers for different paths
const indexRouter = require('./routes/index'); // Router for the homepage and other routes related to the root path
const loginRouter = require('./routes/login'); // Router for login related paths
const registerRouter = require('./routes/register'); // Router for register related paths
const publicRouter = require('./routes/public'); // Router for public timeline related paths

// Initialize the Express application
const app = express();

// Set up the view engine (jade/pug)
app.set('views', path.join(__dirname, 'views')); // Specifies the directory where the Jade template files are located
app.set('view engine', 'pug'); // Sets Jade (now Pug) as the template engine for rendering views

// Middleware setup
app.use(logger('dev')); // Use Morgan to log requests to the console in 'dev' format, which includes method, url, status, response time
app.use(express.json()); // Parses incoming requests with JSON payloads, making it easy to handle JSON data
app.use(express.urlencoded({ extended: false })); // Parses incoming requests with URL-encoded payloads, useful for form submissions
app.use(cookieParser()); // Parse Cookie header and populate req.cookies with an object keyed by cookie names
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files (images, CSS, JavaScript) from the 'public' directory

// Route handlers
app.use('/', indexRouter); // Use the index router for requests to the root URL ('/')
app.use('/login', loginRouter); // Use the login router for requests to '/login'
app.use('/register', registerRouter); // Use the register router for requests to '/register'
app.use('/public', publicRouter); // Use the public timeline router for requests to '/public'

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404)); // If no middleware has responded by now, it means a 404 error should be generated and forwarded to the error handler
});

// Error handler middleware
app.use(function(err, req, res, next) {
  // Set locals, providing error details only in development environment
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page, setting the status code
  res.status(err.status || 500);
  res.render('error'); // Uses the view engine to render the error page
});

// Export the app for use by other modules (like the server starter script)
module.exports = app;

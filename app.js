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
const session = require('express-session');

const flash = require('connect-flash');

// Initialize database schema
const db = require('./db/database');

db.initSchema()
	.then(() => {
		console.log('Database schema initialized successfully.');
	})
	.catch((err) => {
		console.error('Error initializing database schema:', err);
	});

// Import routers for different paths
const loginRouter = require('./src/routes/login'); // Router for login related paths
const logoutRouter = require('./src/routes/logout'); // Router for logout related paths
const registerRouter = require('./src/routes/register'); // Router for register related paths
const timelineRouter = require('./src/routes/timeline'); // Router for public timeline related paths
const apiRouter = require('./src/routes/api'); // Router for public timeline related paths

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
app.use(flash());

app.use(session({
	secret: 'devving-and-opssing',
	resave: false,
	saveUninitialized: true,
}));

// Route handlers
app.use('/api', apiRouter); // Use the public timeline router for requests to '/'
app.use('/login', loginRouter); // Use the login router for requests to '/login'
app.use('/logout', logoutRouter); // Use the logout router for requests to '/login'
app.use('/register', registerRouter); // Use the register router for requests to '/register'
app.use('/', timelineRouter); // Use the public timeline router for requests to '/'

// Error handler middleware
app.use((err, req, res, next) => {
	// Set locals, providing error details only in development environment
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// Render the error page, setting the status code
	res.status(err.status || 500);
	res.render('error'); // Uses the view engine to render the error page
});

app.use((req, res, next) => {
	res.success_messages = req.flash('success');
	res.error_messages = req.flash('error');
	next();
});
// Export the app for use by other modules (like the server starter script)
module.exports = app;

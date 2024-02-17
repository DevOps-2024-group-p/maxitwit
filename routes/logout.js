var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
var session = require('express-session');
const db = require('../db/database');

router.use(session({
    secret: 'devving-and-opssing',
    resave: false,
    saveUninitialized: true
}));

router.use(function (req, res, next) {
    res.locals.success_messages = req.flash('success');
    res.locals.error_messages = req.flash('error');
    next();
})

const requireAuth = (req, res, next) => {
    if (req.session.username) {
        next();
    } else {
        res.redirect('/public');
    }
}

function getUserCredentialsFromSession(req) {
    if (req.session.username) {
        return {
            user: {
                id: req.session.username.id,
                username: req.session.username.username
            }
        }
    } return { user: {} }
}

router.get('/', requireAuth, function (req, res) {
    const g = getUserCredentialsFromSession(req);
    console.log('logout start');
    req.session.username = null;
    console.log('username nulled');
    req.flash('success', 'You were logged out');
    res.redirect('/public');
});


// /* GET login page. */
// router.get('/', function (req, res) {
//     const g = getUserCredentialsFromSession(req);
//     res.render('login', { title: 'Login', g: g });
// });

// router.post('/', (req, res, next) => {
//     const { username, password } = req.body;

//     // Input validation
//     if (!username || !password) {
//         req.flash('error', 'Please enter username and password');
//         return res.redirect('/login');
//     }

//     // Check user in DB
//     const sql = 'SELECT * FROM user WHERE username = ?';
//     db.getDb().get(sql, [username], (err, user) => {
//         if (err) {
//             console.error(err.message);
//             return res.status(500).send('Server error');
//         }
//         if (!user) {
//             req.flash('error', 'Invalid username');
//             res.redirect('/login');
//         } else {
//             bcrypt.compare(password, user.pw_hash, (err, result) => {
//                 if (err) {
//                     console.error(err.message);
//                     return res.status(500).send('Server error');
//                 }
//                 if (result) {
//                     req.session.username = {
//                         id: user.user_id,
//                         username: username
//                     };
//                     console.log(req.session.username)
//                     req.flash('success', 'You were logged in');
//                     return res.redirect('/');
//                 } else {
//                     req.flash('error', 'Invalid password');
//                     return res.redirect('/login');
//                 }
//             });
//         }
//     });
// });



module.exports = router;

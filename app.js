const express = require('express');
const path = require('path');
const session = require('express-session');
const fs = require("fs");

const app = express();
const port = process.env.PORT || 8080;

//Setup directories
var dir = ['./backup', './public/legal', './uploads'];

dir.forEach(function (currentValue, index, arr) {
  if (!fs.existsSync(path.join(__dirname, currentValue))) {
    fs.mkdirSync(path.join(__dirname, currentValue));
  }
});


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 
app.use(session({
  secret: 'Sapphire2025',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next(); // User is authenticated, continue to next middleware
  } else {
    res.redirect('/login'); // User is not authenticated, redirect to login page
  }
}


// Routes will go here

app.get('/', requireAuth, function (req, res) {
  // res.render('dashboard', {userName : req.session.userId, page : 'dash'});
  res.redirect("/agenda");
});

//getUserName
const userNameRoute = require('./router/username');
app.use('/getUserName', userNameRoute);

//Roster
const rosterRoute = require('./router/roster');
app.use('/roster', rosterRoute);

//Login page
const loginRoute = require('./router/login');
app.use('/login', loginRoute);

//Agenda page

const agendaRoute = require('./router/agenda');
app.use('/agenda', agendaRoute);

//Activity page 
const viewRoute = require('./router/view');
app.use('/view', viewRoute);

//Analyze page
const analyzeRoute = require('./router/analyze'); 
app.use('/analyze', analyzeRoute);

//Closings Page
const closingRoute = require('./router/closing');
app.use('/closing', closingRoute);

//Utilities page 
const utilitiesRoute = require('./router/utilities');
app.use('/utilities', utilitiesRoute);

//Team page 
const addRoute = require('./router/add');
app.use('/add', addRoute);

//Settings Page
const settingsRoute = require('./router/settings');
app.use('/settings', settingsRoute);

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', requireAuth, function (req, res) {
  res.render('404', { userName: req.session.userId, page: '404' });
});

app.post('*', requireAuth, function (req, res) {
  res.render('404', { userName: req.session.userId, page: '404' });
});

app.listen(port, '0.0.0.0');
console.log('Server started at http://localhost:' + port);
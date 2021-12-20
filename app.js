require('dotenv').config();
const bcrypt = require('bcryptjs');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const passport = require('passport');
const session = require('cookie-session');
const cookieParser = require('cookie-parser');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');

const User = require('./models/User');

// Routes
const indexRouter = require('./routes/index');
const signUpRouter = require('./routes/signUp');
const signInRouter = require('./routes/signIn');
const upgradeRouter = require('./routes/upgrade');

// Database connection
const mongodb = process.env.MONGODB_URL;
mongoose.connect(mongodb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '));

const app = express();
// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middlewares
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  }),
);

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {
          field: 'username',
          message: 'Incorrect username.',
        });
      }
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) return done(err);
        if (!isMatch) {
          return done(null, false, {
            field: 'password',
            message: 'Incorrect password',
          });
        }
        return done(null, user);
      });
    });
  }),
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) =>
  User.findById(id, (err, user) => done(err, user)),
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  if (typeof req.user === 'undefined') {
    return next();
  }

  res.locals.currentUser = {
    _id: req.user._id,
    first_name: req.user.first_name,
    last_name: req.user.last_name,
    username: req.user.username,
    membership_status: req.user.membership_status,
    isAdmin: req.user.isAdmin,
  };
  next();
});

// Route Handler
app.use('/', indexRouter);
app.use('/sign-up', signUpRouter);
app.use('/sign-in', signInRouter);
app.use('/upgrade', upgradeRouter);

// 404 Handler
app.use((req, res, next) => next(createError(404)));

// Error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, () => console.log('App running on port 3000!'));

const express = require('express');
const router = express.Router();
const passport = require('passport');

// GET - Login page
router.get('/', (req, res) => {
  res.render('sign-in', { title: 'Sign In' });
});

// POST - Login page
router.post(
  '/',
  passport.authenticate('local', {
    failureRedirect: '/sign-in',
  }),
  (req, res) => {
    res.redirect('/');
  },
);

module.exports = router;

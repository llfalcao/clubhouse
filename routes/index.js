const express = require('express');
const router = express.Router();

// GET - Homepage
router.get('/', (req, res) => {
  res.render('index', { title: 'Clubhouse', user: res.locals.currentUser });
});

// GET - Logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;

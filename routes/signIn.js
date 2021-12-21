const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET - Login page
router.get('/', (req, res) => {
  if (res.locals.currentUser) return res.redirect('/');
  res.render('sign-in', { title: 'Clubhouse | Sign in' });
});

// POST - Login page
router.post('/', userController.userSignInPOST);

module.exports = router;

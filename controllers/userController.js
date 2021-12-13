const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Display sign-up form on GET
exports.userCreateGET = (req, res) => {
  res.render('sign-up-form', { title: 'Sign Up' });
};

const signUpFormValidation = [
  body('first_name', 'The first name must have between 2 and 50 characters.')
    .trim()
    .isLength({ min: 2, max: 50 }),
  body('last_name', 'The last name must have between 2 and 50 characters.')
    .trim()
    .isLength({ min: 2, max: 50 }),
  body('username', 'The username must have between 3 to 50 characters.')
    .trim()
    .isLength({ min: 3, max: 50 }),
  body('password', 'The password must contain at least 8 characters.').isLength(
    {
      min: 8,
      max: 50,
    },
  ),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match.');
    } else {
      return true;
    }
  }),
];

async function hashPassword(password) {
  const hash = await new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });

  return hash;
}

// Handle sign-up form data on POST
exports.userCreatePOST = [
  signUpFormValidation,

  async (req, res, next) => {
    const errors = validationResult(req);
    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      username: req.body.username,
      password: await hashPassword(req.body.password),
      membership_status: 'user',
    });

    if (!errors.isEmpty()) {
      res.render('sign-up-form', {
        title: 'Sign Up',
        user,
        errors: errors.array(),
      });
    } else {
      user.save((err) => {
        if (err) return next(err);
        res.redirect('/');
      });
    }
  },
];

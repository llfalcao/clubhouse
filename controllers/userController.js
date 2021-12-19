const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const User = require('../models/User');

async function isUsernameAvailable(username) {
  const isMatch = await User.findOne({ username }).exec();
  if (isMatch) throw new Error();
  return true;
}

const signUpFormValidation = [
  body('first_name', 'First name required.')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must contain 2 to 50 characters.'),

  body('last_name', 'Last name required.')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must contain 2 to 50 characters.'),

  body('username', 'Username required.')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Username must contain 2 to 50 characters.')
    .custom(async (username) => {
      if (!username.match(/^[A-Za-z0-9]+$/)) {
        throw new Error(
          'Username must not contain spaces or special characters (e.g. !@#$)',
        );
      }
      const isMatch = await User.findOne({ username }).exec();
      if (isMatch) throw new Error('Username not available');

      return true;
    }),

  body('password', 'Password required.')
    .isLength({ min: 8 })
    .withMessage('Password must contain at least 8 characters'),

  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match.');
    }
    return true;
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

// Display sign-up form on GET
exports.userCreateGET = (req, res) => {
  res.render('sign-up-form', { title: 'Clubhouse | Sign up' });
};

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
        title: 'Clubhouse | Sign up',
        userInfo: user,
        errors: errors.array(),
      });
    } else {
      user.save((err) => {
        if (err) return next(err);
        req.logIn(user, (err) => {
          if (err) return next(err);
          return res.redirect('/');
        });
      });
    }
  },
];

// Display user upgrade form on GET
exports.userUpgradeGET = (req, res) => {
  if (!res.locals.currentUser) {
    res.redirect('/sign-in');
    return;
  }

  res.render('upgrade', {
    title: 'Clubhouse | Upgrade membership',
    user: res.locals.currentUser,
  });
};

// Handle upgrade form on POST
exports.userUpgradePOST = (req, res) => {
  if (req.body.secret === process.env.MEMBERSHIP_UPGRADE_SECRET) {
    User.updateOne(
      { _id: res.locals.currentUser._id },
      { membership_status: 'member' },
    ).exec((err) => {
      if (err) return next(err);
      res.redirect('/');
    });
  } else {
    res.render('upgrade', {
      title: 'Clubhouse | Upgrade membership',
      user: res.locals.currentUser,
      error:
        'Incorrect passcode. Tip: it\'s lowercase and it contains at least 2 "L"s',
    });
  }
};

// Handle sign-in form on POST
exports.userSignInPOST = [
  body('username', 'Username required').notEmpty(),
  body('password', 'Password required').notEmpty(),
  (req, res, next) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors = errors.array();
      return res.render('sign-in', {
        title: 'Clubhouse | Sign in',
        username: req.body.username,
        usernameError: errors.find((el) => el.param === 'username'),
        passwordError: errors.find((el) => el.param === 'password'),
      });
    }

    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);

      if (!user && info.field === 'username') {
        return res.render('sign-in', {
          title: 'Clubhouse | Sign in',
          username: req.body.username,
          usernameError: { msg: info.message },
        });
      }

      if (!user && info.field === 'password') {
        return res.render('sign-in', {
          title: 'Clubhouse | Sign in',
          username: req.body.username,
          passwordError: { msg: info.message },
        });
      }

      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.redirect('/');
      });
    })(req, res, next);
  },
];

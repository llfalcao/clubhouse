const { body, validationResult } = require('express-validator');

const Message = require('../models/Message');

// Display messages on GET
exports.messageListGET = async (req, res, next) => {
  try {
    const messages = await Message.find({})
      .populate({ path: 'author', select: ['username', 'membership_status'] })
      .sort({ timestamp: -1 })
      .exec();
    res.render('index', {
      title: 'Clubhouse',
      user: res.locals.currentUser,
      messages,
    });
  } catch (err) {
    return next(err);
  }
};

// Handle new message on POST
exports.messageCreatePOST = [
  body('title', 'Title required').trim().isLength({ min: 1, max: 100 }),
  body('text', 'Message required').trim().isLength({ min: 1, max: 280 }),
  (req, res, next) => {
    const user = JSON.parse(req.body.user);
    const errors = validationResult(req);
    const message = new Message({
      title: req.body.title,
      text: req.body.text,
      timestamp: new Date(),
      author: user._id,
    });

    if (!errors.isEmpty()) {
      res.render('index', {
        title: 'Clubhouse',
        user: req.body.user,
        message,
        errors: errors.array(),
      });
    } else {
      message.save(async (err) => {
        if (err) return next(err);
        const messages = await Message.find({})
          .sort({ timestamp: -1 })
          .populate({
            path: 'author',
            select: ['username', 'membership_status'],
          })
          .exec();
        res.render('index', {
          title: 'Clubhouse',
          user: req.body.user,
          messages,
        });
      });
    }
  },
];

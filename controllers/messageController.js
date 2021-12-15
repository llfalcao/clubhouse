const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const Message = require('../models/Message');

async function getMessages() {
  return await Message.find({}).exec();
}

// Handle new message on POST
exports.messageCreatePOST = [
  body('title', 'Title required').trim().isLength({ min: 1, max: 100 }),
  body('text', 'Message required').trim().isLength({ min: 1, max: 280 }),
  (req, res, next) => {
    console.log(req.body);
    const errors = validationResult(req);
    const message = new Message({
      title: req.body.title,
      text: req.body.text,
      timestamp: new Date(),
      author: req.body.user._id,
    });

    if (!errors.isEmpty()) {
      console.log(message);
      res.render('index', {
        title: 'Clubhouse',
        user: req.body.user,
        message,
        errors: errors.array(),
      });
    } else {
      message.save(async (err) => {
        if (err) return next(err);

        res.render('index', {
          title: 'Clubhouse',
          user: req.body.user,
          messages: await getMessages(),
        });
      });
    }
  },
];

const { body, validationResult } = require('express-validator');

const Message = require('../models/Message');

async function getMessages() {
  return await Message.find({})
    .sort({ timestamp: -1 })
    .populate({
      path: 'author',
      select: ['username', 'membership_status'],
    })
    .exec();
}

// Display messages on GET
exports.messageListGET = async (req, res, next) => {
  const messages = await getMessages();
  res.render('index', {
    title: 'Clubhouse',
    user: res.locals.currentUser,
    messages,
  });
};

// Handle new message on POST
exports.messageCreatePOST = [
  body('title', 'Title required').trim().isLength({ min: 1, max: 100 }),
  body('text', 'Message required').trim().isLength({ min: 1, max: 280 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    const message = new Message({
      title: req.body.title,
      text: req.body.text,
      timestamp: new Date(),
      author: res.locals.currentUser._id,
    });

    if (!errors.isEmpty()) {
      const messages = await getMessages();
      res.render('index', {
        title: 'Clubhouse',
        user: res.locals.currentUser,
        message,
        messages,
        errors: errors.array(),
      });
    } else {
      message.save(async (err) => {
        if (err) return next(err);
        const messages = await getMessages();
        res.render('index', {
          title: 'Clubhouse',
          user: res.locals.currentUser,
          messages,
        });
      });
    }
  },
];

// Display message delete form on GET
exports.messageDeleteGET = async (req, res, next) => {
  const isAdmin = res.locals.currentUser;
  if (isAdmin === undefined || !isAdmin) {
    return res.redirect('/');
  }

  try {
    const message = await Message.findOne({ _id: req.params.message })
      .populate('author', 'username')
      .exec();
    res.render('messageDetail', {
      title: 'Clubhouse | Remove message',
      user: res.locals.currentUser,
      message,
    });
  } catch (err) {
    return next(err);
  }
};

// Handle message delete form on POST
exports.messageDeletePOST = async (req, res, next) => {
  try {
    await Message.deleteOne({ _id: req.params.message });
    res.redirect('/');
  } catch (err) {
    return next(err);
  }
};

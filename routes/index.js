const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

const Message = require('../models/Message');

// GET - Homepage
router.get('/', async (req, res) => {
  const messages = await Message.find({})
    .populate({ path: 'author', select: ['username', 'membership_status'] })
    .exec();
  res.render('index', {
    title: 'Clubhouse',
    user: res.locals.currentUser,
    messages,
  });
});

// POST - Message
router.post('/', messageController.messageCreatePOST);

// GET - Logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;

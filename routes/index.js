const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// GET - Homepage
router.get('/', messageController.messageListGET);

// POST - Message
router.post('/', messageController.messageCreatePOST);

// GET - Logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;

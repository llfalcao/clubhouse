const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// GET - Homepage
router.get('/', messageController.messageListGET);

// POST - Message
router.post('/', messageController.messageCreatePOST);

// GET - Delete message
router.get('/:message/delete', messageController.messageDeleteGET);

// POST - Delete message
router.post('/:message/delete', messageController.messageDeletePOST);

// GET - Logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;

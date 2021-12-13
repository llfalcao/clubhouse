const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

// GET - Create User
router.get('/', userController.userCreateGET);

// POST - Create User
router.post('/', userController.userCreatePOST);

module.exports = router;

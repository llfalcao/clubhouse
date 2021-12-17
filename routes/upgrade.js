const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

// GET upgrade form
router.get('/', userController.userUpgradeGET);

// POST upgrade form
router.post('/', userController.userUpgradePOST);
module.exports = router;

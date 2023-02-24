const express = require('express');
const authController = require('./../controllers/authController');

const router = express.Router();

router.get('/:userId/:tokenValue', authController.verifyUser);

module.exports = router;
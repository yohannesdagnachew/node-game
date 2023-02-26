const express = require('express');
// const { signUp, verifyOtp, login } = require('../controllers/auth');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/verifyOtp', authController.verifyOtp);

router.use(authController.protect);

router.delete('/logout', authController.logout);

module.exports = router;

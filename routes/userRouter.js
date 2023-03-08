const express = require('express');
// const { signUp, verifyOtp, login } = require('../controllers/auth');
const authController = require('../controllers/authController');
const usersController = require('../controllers/usersController');
const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOtp);
router.get('/refresh', authController.refreshAccessToken);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.delete('/logout', authController.logout);
router.post('/google-signin', authController.googleSignin);

router.use(authController.protect);
router.patch('/update-my-password', authController.updatePassword);
router.patch('/update-my-phone-number', authController.updatePhoneNumber);
router.patch(
	'/update-me',
	usersController.uploadUserPhoto,
	usersController.resizeUserPhoto,
	usersController.updateMe
);

module.exports = router;

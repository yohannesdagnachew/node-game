const router = require('express').Router();
const { signUp, verifyOtp, login } = require('../Controllers/auth');

router.route('/signup').post(signUp); // POST /user/signUp

router.route('/verifyOtp').post(verifyOtp); // POST /user/verifyOtp

router.route('/login').post(login); // POST /user/login

module.exports = router;
const router = require('express').Router();
const { signUp, verifyOtp } = require('../Controllers/auth');

router.route('/signup').post(signUp); // POST /user/signUp

router.route('/verifyOtp').post(verifyOtp); // POST /user/verifyOtp

module.exports = router;
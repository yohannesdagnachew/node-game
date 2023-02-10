const router = require('express').Router();
const { signUp, verifyOtp } = require('../Controllers/userController');

router.post('/signup', signUp); // POST /user/signup

router.post('/verifyOtp', verifyOtp); // POST /user/verifyOtp

module.exports = router;
const router = require('express').Router();
const { addQuestion } = require('../controllers/question');
const { protect, restrictTo } = require('../controllers/authController');

router.use(protect, restrictTo('admin'));
router.route('/').post(addQuestion); // POST /question

module.exports = router;

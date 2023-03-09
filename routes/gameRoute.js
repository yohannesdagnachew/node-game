const router = require('express').Router();
const {
	createGame,
	answerGameQuestion,
	testGame,
} = require('../controllers/game');
const { protect } = require('../controllers/authController');

router.use(protect);
router.route('/next').post(createGame); // POST /game

router.route('/answer').post(answerGameQuestion); // POST /game/answer
router.route('/test-game').get(testGame);

module.exports = router;

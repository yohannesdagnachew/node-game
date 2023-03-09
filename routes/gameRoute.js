const router = require('express').Router();
const {
	createGame,
	answerGameQuestion,
	getGameHistory
} = require('../controllers/game');
const { protect } = require('../controllers/authController');

router.use(protect);
router.route('/play').post(createGame); // POST /game
router.route('/history').post(getGameHistory); // GET /game/history


router.route('/answer').post(answerGameQuestion); // POST /game/answer


module.exports = router;

const router = require('express').Router();
const {createGame, answerGameQuestion} = require('../Controllers/game');

router.route('/next').get(createGame); // POST /game

router.route('/answer').post(answerGameQuestion); // POST /game/answer

module.exports = router;
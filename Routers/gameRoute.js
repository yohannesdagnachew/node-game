const router = require('express').Router();
const {createGame, answerGameQuestion} = require('../Controllers/game');

router.route('/netx').post(createGame); // POST /game

router.route('/answer').get(answerGameQuestion); // POST /game/answer

module.exports = router;
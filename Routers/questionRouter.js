const router = require('express').Router();
const {addQuestion}= require('../Controllers/question');

router.route('/').post(addQuestion); // POST /question

module.exports = router;
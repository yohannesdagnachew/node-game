const Game = require('../models/game');
const Question = require('../models/questionModel');
const Users = require('../models/users');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const jwtPublicKey = process.env.JWT_PRIVATE_KEY;
const catchAsync = require('../utils/catchAsync');

module.exports.testGame = async (req, res) => {
	console.log('Protected route', req.user);
};

module.exports.createGame = async (req, res) => {
	const { userId } = req;

	try {
		// let payload = jwt.verify(token, jwtPublicKey);
		const user = await Users.findById(userId);
		console.log(user);
		// if (!user) return res.status(400).send('Invalid user');
		if (user.balance <= 10) return res.status(400).send('Insufficient Balance');
		user.balance = user.balance - 10;
		await user.save();

		const question = await Question.aggregate([{ $sample: { size: 3 } }]);
		const game = new Game({
			question1: question[0],
			question2: question[1],
			question3: question[2],
			user: user._id,
		});

		await game.save();
		const questionOne = game.question1;
		const gameId = game._id;
		res
			.status(200)
			.send({ message: 'Game created successfully', gameId, questionOne });
	} catch (error) {
		console.log(error);
		return res.status(400).send('session expired');
	}
};

module.exports.answerGameQuestion = catchAsync(async (req, res, next) => {
	// const token = req.body.token;
	// const payload = jwt.verify(token, jwtPublicKey);
	// const user = await Users.findOne({ _id: payload._id });
	const { user } = req;

	const { answer, gameId } = req.body;
	const game = await Game.findOne({ _id: gameId });
	const answeredTime = game.createdAt.getTime();
	const currentTime = new Date().getTime();
	console.log(answeredTime, currentTime);
	if (currentTime - answeredTime > 1000)
		return next(new AppError('Time out', 400));
	// return res.status(400).send('Time out');

	if (!game) return next(new AppError('Invalid game'), 400);
	// res.status(400).send('Invalid game');
	if (game.counter > 3) return res.status(400).send('Game already completed');

	const nextQuestion = game[`question${game.counter + 1}`];
	const prvQuestion = game[`question${game.counter}`];

	const question = await Question.findOne({
		questionId: prvQuestion.questionId,
	});
	if (!question) return res.status(400).send('Invalid question');
	if (question.answer === answer) {
		game.score = game.score + 1;
	}
	game.counter = game.counter + 1;

	if (game.counter === 4 && game.score === 3) {
		user.balance = user.balance + 100;
		await user.save();
	}

	await game.save();
	if (game.counter > 3) return res.status(400).send('Game already completed');
	return res
		.status(200)
		.send({ message: 'Game answered successfully', nextQuestion });
});

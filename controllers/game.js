const Game = require('../models/game');
const Question = require('../models/questionModel');
const Users = require('../models/users');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const jwtPublicKey = process.env.JWT_PRIVATE_KEY;
const catchAsync = require('../utils/catchAsync');
const Temp = require('../models/temp');


module.exports.createGame = catchAsync(async (req, res, next) =>  {
	const { userId } = req;

	try {
		const user = await Users.findById(userId);
		
		if (user.balance <= 10) return next(new AppError('Insufficient balance', 400));
		user.balance = user.balance - 10;
		await user.save();

		const question = await Question.aggregate([{ $sample: { size: 1 } }]);
		const tempQuestion = new Temp({
			question: question[0].question,
			option1: question[0].option1,
			option2: question[0].option2,
			option3: question[0].option3,
			option4: question[0].option4,
			answer: question[0].answer,
			questionId: question[0]._id.toString(),
		});
		await tempQuestion.save();
		const game = new Game({
			question1: question[0],
			user: user._id,
		});

		await game.save();
		const questionOne = game.question1;
		const gameId = game._id;
		res
			.status(200)
			.send({ message: 'Game created successfully', gameId, questionOne, questionId: tempQuestion._id });
	} catch (error) {
		console.log(error);
		return next(new AppError('Something went wrong', 500));
	}
});

module.exports.answerGameQuestion = catchAsync(async (req, res, next) => {
	const { userId} = req;
	const  user =  await Users.findById(userId);

	const user_id = user._id;
	const { answer, gameId, questionId } = req.body;
	const game = await Game.findOne({ _id: gameId });
	if (!game) return next(new AppError('Invalid game'), 400);
	const gameCreatedTime = game.createdAt.getTime();
	const currentTime = new Date().getTime();
	if(game.user !== user_id.toString()) return next(new AppError('Invalid user'), 400);
	if (currentTime - gameCreatedTime > 100000000)
		return next(new AppError('Time out', 400));
	

	
	if (game.counter > 3) return res.status(200).send({massage: 'Game already completed', gameResult: game.score, gameCounter: game.counter});


const question1 = await Question.aggregate([{ $sample: { size: 1 } }]);
const tempQuestion = new Temp({
	question: question1[0].question,
	option1: question1[0].option1,
	option2: question1[0].option2,
	option3: question1[0].option3,
	option4: question1[0].option4,
	answer: question1[0].answer,
	questionId: question1[0]._id.toString(),
});
await tempQuestion.save();

game[`question${game.counter + 1}`]= question1[0];
await game.save();


	const nextQuestion = game[`question${game.counter + 1}`];
	const prevQuestion = game[`question${game.counter}`];
    const prevQuestionId = prevQuestion._id.toString(); 

	const question = await Temp.findById(questionId)

	console.log(questionId);
	if (!question) return res.status(400).send('Invalid question');
	console.log(prevQuestionId, questionId);
	if (question.answer === answer) {
		game.score = game.score + 1;
	}
	question.remove();
	game.counter = game.counter + 1;

	if (game.counter === 4 && game.score === 3) {
		user.balance = user.balance + 100;
		await user.save();
	}

	await game.save();
	if (game.counter > 3) return res.status(200).send({massage: 'Game already completed', gameResult: game.score});
	return res
		.status(200)
		.send({ message: 'Game answered successfully', nextQuestion, gameCounter: game.counter, gameResult: "", questionId: tempQuestion._id });
});

module.exports.getGameHistory = catchAsync(async (req, res, next) => {
	const { gameId } = req.body;
	const game = await Game.findOne({ _id: gameId });
	if (!game) return next(new AppError('Invalid game'), 400);
    const result = {
		score: game.score,
	};
	return res.status(200).send({ message: 'Game history', result });
});

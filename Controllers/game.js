const Game = require("../Models/game");
const Question = require("../models/questionModel");
const Users = require("../Models/users");
const jwt = require("jsonwebtoken");
const jwtPublicKey = process.env.JWT_PRIVATE_KEY;

module.exports.createGame = async (req, res) => {
  const token = req.body.token;
  try {
    let payload = jwt.verify(token, jwtPublicKey);
    const user = await Users.findOne({ _id: payload._id });
    if (!user) return res.status(400).send("Invalid user");
    if(user.balance <= 10) res.status(400).send("Insufficient Balance")
    user.balance = user.balance - 10;
    await user.save();

    const question = await Question.aggregate([{ $sample: { size: 3 } }]);
    const game = new Game({
      question1: question[0],
      question2: question[1],
      question3: question[2],
      user: payload._id,
    });

    await game.save();
    const questionOne = game.question1;
    const gameId = game._id;
    res
      .status(200)
      .send({ message: "Game created successfully", gameId, questionOne });
  } catch (error) {
    return res.status(400).send("session expired");
  }
};

module.exports.answerGameQuestion = async (req, res) => {
  const token = req.body.token;
  const payload = jwt.verify(token, jwtPublicKey);
  const user = await Users.findOne({ _id: payload._id });

  const { answer, gameId } = req.body;
  const game = await Game.findOne({ _id: gameId });
  console.log(game.createdAt);
  if (!game) return res.status(400).send("Invalid game");

  const nextQuestion = game[`question${game.counter + 1}`];
  const prvQuestion = game[`question${game.counter}`];

  if (game.counter > 3) return res.status(400).send("Game already completed");
  const question = await Question.findOne({
    questionId: prvQuestion.questionId,
  });
  if (!question) return res.status(400).send("Invalid question");
  if (question.answer === answer) {
    game.score = game.score + 1;
  }
  game.counter = game.counter + 1;

  if (game.counter === 4 && game.score === 3) {
    user.balance = user.balance + 100;
    await user.save();
  }

  await game.save();

  res.status(200).send({ message: "Game answered successfully", nextQuestion });
};

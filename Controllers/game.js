const Game = require('../Models/game');
const Question = require('../models/questionModel');



module.exports.createGame = async (req, res) => {
    const question = await Question.aggregate([{$sample: {size: 3}}]);
    const game  = new  Game({
        question1: question[0],
        question2: question[1],
        question3: question[2],
    });
    const questions = await game.save();
    res.status(200).send({message: "Game created successfully", questions});
}

module.exports.answerGameQuestion = async (req, res) => {
    const  {questionId, answer, gameId} = req.body;
    const question = await Question.findOne({questionId: questionId});
    if(!question) return res.status(400).send("Invalid question");
    if(question.answer !== answer) {
        res.status(200).send({message: "Wrong answer"});
    }
    const game = await Game.findOne({_id: gameId});
    if(!game) return res.status(400).send("Invalid game");
    game.score = game.score + 1;
    await game.save();
    res.status(200).send({message: "Game answered successfully", game});
}
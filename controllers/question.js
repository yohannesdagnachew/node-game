const Question = require('../models/questionModel');

module.exports.addQuestion = async (req, res) => {
	const { question, option1, option2, option3, option4, answer, questionId } =
		req.body;
	const questionData = new Question({
		question,
		option1,
		option2,
		option3,
		option4,
		answer,
		questionId,
	});
	const data = await questionData.save();
	res.status(200).send({ message: 'Question added successfully', data });
};

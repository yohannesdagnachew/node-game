const Question = require('../models/questionModel');




module.exports.addQuestion = async (req, res) => {
    console.log(req.body);
    res.status(200).send("Question added successfully");
}
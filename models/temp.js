const mongoose = require('mongoose');


const tempoQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    option1: {
        type: String,
        required: true,
    },
    option2: {
        type: String,
        required: true,
    },
    option3: {
        type: String,
        required: true,
    },
    option4: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    questionId: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 1500,
    },
}, { timestamps: true});



module.exports = mongoose.model('Temp', tempoQuestionSchema);
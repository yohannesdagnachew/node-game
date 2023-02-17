const mongoose = require('mongoose');


const questionSchema = new mongoose.Schema({
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
}, { timestamps: true });



module.exports = mongoose.model('Questions', questionSchema );
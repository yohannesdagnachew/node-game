const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const gameSchema = new mongoose.Schema({
    question1: {
        type: Object,
        timestamps: true,
    },
    question2: {
        type: Object,
        timestamps: true,
    },
    question3: {
        type: Object,
        timestamps: true,
    },
    score: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });



module.exports = mongoose.model('Game', gameSchema);
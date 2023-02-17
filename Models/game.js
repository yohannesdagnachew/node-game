const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const gameSchema = new mongoose.Schema({
    id : {
        type: String,
        required: true,
    },
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
}, { timestamps: true });



module.exports = mongoose.model('Game', gameSchema);
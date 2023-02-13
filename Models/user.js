const mongoose = require('mongoose');



const subscribersSchema = new  mongoose.Schema({
    name: {
        type: String,   
        required: true, 
    },
}, { timestamps: true });

module.exports = mongoose.model('Subscribers', subscribersSchema);
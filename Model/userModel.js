const { Schema, model } = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    number: {
        type: String,
        required: true,
    },
}, { timestamps: true });

userSchema.methods.generateAuthToken =  function() {
    const token = jwt.sign({ _id: this._id, number: this.number }, process.env.JWT_PRIVATE_KEY, {expiresIn: '1d'});
    return token;
} 

module.exports = model('User', userSchema);
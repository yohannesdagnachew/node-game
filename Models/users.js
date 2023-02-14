const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
}, { timestamps: true });

userSchema.methods.generateAuthToken =  () => {
    const token = jwt.sign({ _id: this._id, number: this.number }, process.env.JWT_PRIVATE_KEY, {expiresIn: '1d'});
    return token;
} 

module.exports = mongoose.model('Users', userSchema);
const bcrypt =  require('bcrypt');
const _ = require('lodash');
const axios = require('axios');
const otpGenerator = require('otp-generator');

const Users  = require('../Models/users');
const { Otp } = require('../Models/otpModel');

module.exports.signUp = async (req, res) => {
    const user =  await Users.find({ name: req.body.name });
    if(user.length > 0) return res.status(400).send('User already registered');
    try {
        const newUser = new Users({
            name: req.body.name,
        });
        const result = await newUser.save();
        res.status(200).json(result);
    }
    catch (err) {
        res.status(400).send(err.message);
    }
    
//     const OTP = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
//     const number = req.body.number;
//     console.log(OTP)
//     console.log(number)

//     const otp = new Otp({
//         number: number,
//         otp: OTP,
//     });
//    const salt = await bcrypt.genSalt(10);
//    otp.otp = await bcrypt.hash(otp.otp, salt);
//    const result = await otp.save();
//    return res.status(200).send("Otp send succesfully");
}

module.exports.verifyOtp = async (req, res) => {
}
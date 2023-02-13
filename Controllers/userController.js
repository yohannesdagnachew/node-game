const bcrypt =  require('bcrypt');
const _ = require('lodash');
const axios = require('axios');
const otpGenerator = require('otp-generator');

const { User } = require('../Models/userModel');
const { Otp } = require('../Models/otpModel');

module.exports.signUp = async (req, res) => {
    // const user = User.find({ number: req.body.number });
    // if(user) return res.status(400).send('User already registered');
    const OTP = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
    const number = req.body.number;
    console.log(OTP)
    console.log(number)

    const otp = new Otp({
        number: number,
        otp: OTP,
    });
   const salt = await bcrypt.genSalt(10);
   otp.otp = await bcrypt.hash(otp.otp, salt);
   const result = await otp.save();
   return res.status(200).send("Otp send succesfully");
}

module.exports.verifyOtp = async (req, res) => {
}
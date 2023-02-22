const bcrypt =  require('bcrypt');
const _ = require('lodash');
const generateToken = require('../utils/generateToken');
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');
const jwtPublicKey= process.env.JWT_PUBLIC_KEY;


const Users  = require('../Models/users');
const { Otp } = require('../Models/otpModel');
const requestValidation = require('../utils/requestValidation');
const loginValidation = require('../utils/requestValidation');

module.exports.signUp = async (req, res) => {
    const { error } = requestValidation.signUpValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    const user =  await Users.find({ email: req.body.email, phone: req.body.phone, name: req.body.name});
    if(user.length > 0) return res.status(400).send('User already registered');
    const OTP = otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
    const number = req.body.phone;
    console.log(OTP);

    const otp = new Otp({
        number: number,
        otp: OTP,
    });
   const salt = await bcrypt.genSalt(10);
   otp.otp = await bcrypt.hash(otp.otp, salt);
   const result = await otp.save();
   const hashedPassword = await bcrypt.hash(req.body.password, salt);
   try {
    const newUser = new Users({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        phone: req.body.phone,
    });
     const createUser = await newUser.save();

   }
    catch(err) {
        console.log(err);
    }
   return res.status(200).send({message: "OTP sent successfully to your phone number"});
}

module.exports.verifyOtp = async (req, res) => {
    const phoneNumber = req.body.phone;
    const otpHolder = await Otp.find({number: phoneNumber});
    const newUser = await Users.findOne({phone: phoneNumber});
    console.log(newUser);

    if(otpHolder.length === 0 ) return res.status(400).send("Invalid OTP");
    const rightOtp = otpHolder[otpHolder.length - 1]
    const validOtp = await bcrypt.compare(req.body.otp, rightOtp.otp);
    if(rightOtp.number === phoneNumber && validOtp && newUser) {
       newUser.verified = true;
       const createdUser = await newUser.save();
       const {accessToken, refreshToken} = await generateToken(newUser);
       const removeOtp = await Otp.findOneAndDelete({number: phoneNumber});
       return res.status(200).json({accessToken, refreshToken});
    }
    else {
        return res.status(400).send("Invalid OTP or phone number");
    }
}

// Login

module.exports.login = async (req, res) => {
    const user =  await Users.findOne({ email: req.body.email});
    if(!user) return res.status(400).send('Invalid email or password');
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.status(400).send('Invalid email or password');
    const {accessToken, refreshToken} = await generateToken(user);
    res.status(200).json({accessToken, refreshToken});
}
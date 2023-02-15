const bcrypt =  require('bcrypt');
const _ = require('lodash');
const generateToken = require('../utils/generateToken');
const otpGenerator = require('otp-generator');


const Users  = require('../Models/users');
const { Otp } = require('../Models/otpModel');
const { models } = require('mongoose');

module.exports.signUp = async (req, res) => {
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
   return res.status(200).send("Otp send succesfully");
}

module.exports.verifyOtp = async (req, res) => {
    const otpHolder = await Otp.find({number: req.body.phone});
    if(otpHolder.length === 0 ) return res.status(400).send("Invalid OTP");
    const rightOtp = otpHolder[otpHolder.length - 1]
    const validOtp = await bcrypt.compare(req.body.otp, rightOtp.otp);
    if(rightOtp.number === req.body.phone && validOtp) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        try {
            const newUser = new Users({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                passwordConfirm: req.body.passwordConfirm,
                phone: req.body.phone,
            });

            const createUser = await newUser.save();
            const {name, email} = createUser;
            const userData = {
                name: name,
                email: email
            }
            const {accessToken, refreshToken} = await generateToken(createUser);
            const deleteOtp = await Otp.deleteMany({number: req.body.phone});
            res.status(200).json({message: "User created successfully", userData,accessToken, refreshToken});
        }
        catch (err) {
            res.status(400).send(err.message);
        }
    }
}

// Login

module.exports.login = async (req, res) => {
    const user =  await Users.findOne({ name: req.body.name });
    const {accessToken, refreshToken} = await generateToken(user);
    res.status(200).json({accessToken, refreshToken});
}
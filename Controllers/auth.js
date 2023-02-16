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
   const userData = {
         name: req.body.name,
         email: req.body.email,
         phone: req.body.phone,
         password: req.body.password,
   }
   const token = jwt.sign(userData, jwtPublicKey, {expiresIn: '3m'});
   return res.status(200).send({message: "OTP sent successfully", token});
}

module.exports.verifyOtp = async (req, res) => {
    const userDataToVerify = jwt.verify(req.body.token, jwtPublicKey);
    const otpHolder = await Otp.find({number: userDataToVerify.phone});

    if(otpHolder.length === 0 ) return res.status(400).send("Invalid OTP");
    const rightOtp = otpHolder[otpHolder.length - 1]
    const validOtp = await bcrypt.compare(req.body.otp, rightOtp.otp);
    if(rightOtp.number === userDataToVerify.phone && validOtp) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userDataToVerify.password, salt);
        try {
            const newUser = new Users({
                name: userDataToVerify.name,
                email: userDataToVerify.email,
                password: hashedPassword,
                phone: userDataToVerify.phone,
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
    const { error } = loginValidation.loginValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    const user =  await Users.findOne({ email: req.body.email});
    if(!user) return res.status(400).send('Invalid email or password');
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.status(400).send('Invalid email or password');
    const {accessToken, refreshToken} = await generateToken(user);
    res.status(200).json({accessToken, refreshToken});
}
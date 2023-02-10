const bcrypt =  require('bcrypt');
const _ = require('lodash');
const axios = require('axios');
const otpGenerator = require('otp-generator');

const { User } = require('../Models/userModel');
const { Otp } = require('../Models/otpModel');

module.exports.signUp = async (req, res) => {
}

module.exports.verifyOtp = async (req, res) => {
}
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const otpGenerator = require('otp-generator');

const otpSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: true,
		},
		phone: {
			type: String,
			required: true,
		},
		otp: String,

		createdAt: {
			type: Date,
			default: Date.now,
			expires: 3000,
		},
	},
	{ timestamps: true }
);

otpSchema.methods.generateOtp = async function () {
	const OTP = otpGenerator.generate(6, {
		digits: true,
		lowerCaseAlphabets: false,
		upperCaseAlphabets: false,
		specialChars: false,
	});

	console.log('OTP: ', OTP);

	const salt = await bcrypt.genSalt(10);
	this.otp = await bcrypt.hash(OTP, salt);

	this.save();
	return OTP;
};

otpSchema.methods.compareHash = async function (otp) {
	return await bcrypt.compare(otp, this.otp);
};

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;

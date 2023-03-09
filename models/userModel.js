const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');

const phoneRegExp = /^(\+251?(9|7))?\d{8}$/;

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			minlength: [4, 'name has to be atleast 4 characters long'],
		},

		email: {
			type: String,
			unique: true,
			lowercase: true,
			validate: [validator.isEmail, 'Please provide a valid email'],
			required: [true, 'Please provide your email'],
		},
		phone: {
			type: String,
			match: [
				phoneRegExp,
				'Phone number is not valid, please provide a valid phone number',
			],

			required: [true, 'Please provide your phone number'],
			unique: true,
		},
		photo: { type: String, default: 'default.jpg' },
		role: {
			type: String,
			enum: ['user', 'admin'],
			default: 'user',
		},
		verified: {
			type: Boolean,
			default: false,
		},
		password: {
			type: String,
			required: [true, 'A user must have a password'],
			minlength: 8,
			select: false,
		},

		passwordChangedAt: Date,
		passwordResetToken: String,
		passwordResetExpires: Date,
		active: {
			type: Boolean,
			default: true,
		},
		refreshToken: {
			type: String,
			default: null,
		},
		balance: {
			type: Number,
			default: 100,
		},
	},
	{
		timestamps: true,
	}
);

userSchema.pre('save', async function (next) {
	// Only run this function if password was actually modified
	if (!this.isModified('password')) return next();

	this.password = await bcrypt.hash(this.password, 12);

	next();
});

userSchema.methods.correctPassword = async function (
	candidatePassword,
	userPassword
) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(
			this.passwordChangedAt.getTime() / 1000,
			10
		);

		return JWTTimestamp < changedTimestamp;
	}
	return false;
};

userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex');

	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

userSchema.pre('save', function (next) {
	if (!this.isModified('password') || this.isNew) return next();

	this.passwordChangedAt = Date.now() - 1000;
	next();
});

// userSchema.pre('find', function (next) {
//   this.select(
//     '-__v -passwordChangedAt -passwordResetToken -passwordResetExpires -jwt'
//   );

//   next();
// });

const User = mongoose.model('User', userSchema);

module.exports = User;

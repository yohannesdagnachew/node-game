const promisify = require('util').promisify;
const crypto = require('crypto');
const jsonWebtoken = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const generateJwtToken = require('../utils/generateJwtToken.js');
const dotenv = require('dotenv');

const Otp = require('../models/otpModel');
dotenv.config();

const cookiesOption = {
	refresh: {
		maxAge: new Date(
			Date.now() + process.env.REFRESH_TOKEN_COOKIE_EXPIRES_IN * 60 * 1000
		),
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
	},
	access: {
		maxAge: new Date(
			Date.now() + process.env.ACCESS_TOKEN_COOKIE_EXPIRES_IN * 60 * 1000
		),
		httpOnly: false,
		secure: process.env.NODE_ENV === 'production',
	},
};

const createAndSendCookie = (
	user,
	statusCode,
	res,
	type,
	token = '',
	options = {}
) => {
	if (type === 'refresh') {
		res.cookie('refreshToken', token, cookiesOption.refresh);
	}
	if (type === 'access') {
		const accessToken = generateJwtToken('access', {
			_id: user._id,
			name: user.name,
			email: user.email,
			photo: user.photo,
			role: user.role,
		});
		res.cookie('accessToken', accessToken, cookiesOption.access);

		res.status(statusCode).json({
			status: 'success',
			user: {
				name: user.name,
				email: user.email,
				role: user.role,
				photo: user.photo,
				_id: user._id,
			},
		});
	}
};
const signUp = catchAsync(async (req, res, next) => {
	const {
		name,
		email,
		password,
		role = 'user',
		phone,
		passwordChangedAt = Date.now(),
	} = req.body;

	const newUser = await User.create({
		name,
		email,
		password,
		role,
		passwordChangedAt,
		phone,
	});

	const otp = await Otp.create({
		phone: req.body.phone,
		user: newUser._id,
	});

	const OTP = otp.generateOtp();

	console.log(OTP);

	res
		.status(200)
		.send({ message: 'OTP sent successfully to your phone number' });
});

const verifyOtp = catchAsync(async (req, res, next) => {
	const phone = req.body.phone;
	const otpHolder = await Otp.find({ phone });
	if (otpHolder.length === 0) return next(new AppError('Invalid OTP', 400));

	const rightOtp = otpHolder[otpHolder.length - 1];
	const validOtp = rightOtp.compareHash(req.body.otp);

	if (!(rightOtp.phone === phone) || !validOtp)
		return next(new AppError('Invalid OTP or phone number', 400));

	const user = await User.findById(rightOtp.user);

	if (!user) return next(new AppError('Invalid OTP or phone number', 400));

	user.verified = true;

	const refreshToken = generateJwtToken('refresh', {
		id: user._id,
		email: user.email,
	});

	user.refreshToken = refreshToken;

	await user.save();

	createAndSendCookie(user, 200, res, 'access');
	createAndSendCookie(user, 200, res, 'refresh', refreshToken);
});

const login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	// 1 ) Check if email and password exist
	if (!email || !password)
		return next(new AppError('Please provide email and  password !', 400));

	// 2 ) Check if a User exist && password and email are correct
	const user = await User.findOne({ email }).select('+password');

	if (!user || !(await user.correctPassword(password, user.password)))
		return next(new AppError('Incorrect email or password!', 401));

	// 3 ) If everything correct send token to client
	// console.log(user.id, user._id);
	const refreshToken = generateJwtToken('refresh', {
		id: user._id,
		email: user.email,
	});

	user.refreshToken = refreshToken;
	await user.save();

	createAndSendCookie(user, 200, res, 'refresh', refreshToken);
	createAndSendCookie(user, 200, res, 'access');
});

const logout = catchAsync(async (req, res, next) => {
	const cookies = req.cookies;

	if (!cookies?.refreshToken) return res.status(204);

	const refreshToken = cookies.refreshToken;

	jsonWebtoken.verify(
		refreshToken,
		process.env.REFRESH_TOKEN_SECRET,

		async (err, decodedUser) => {
			if (err) return next(new AppError('Forbiden!', 403));

			const foundUser = await User.findById(decodedUser.id);

			if (!foundUser) return next(new AppError('Forbiden!', 403));

			if (String(foundUser._id) !== decodedUser.id)
				return next(new AppError('Forbiden!', 403));

			await User.findByIdAndUpdate(
				foundUser.id,
				{ refreshToken: '' },
				{ new: true }
			);

			// res.cookie('refreshToken', 'loggedout', {
			//   expires: new Date(Date.now() + 10 * 1000),
			//   httpOnly: true,
			// });

			//  res.cookie('accessToken', 'loggedout', {
			//   expires: new Date(Date.now() + 10 * 1000),
			//   httpOnly: true,
			// });

			res.clearCookie('refreshToken');
			res.clearCookie('accessToken');

			res.status(200).json({ status: 'success' });
		}
	);
});

const protect = catchAsync(async (req, res, next) => {
	// 1) Get token
	const refreshToken = req.cookies['refreshToken'];
	const accessTokenCookie = req.cookies['accessToken'];

	let accessTokenAuthHeader;

	if (!refreshToken || !accessTokenCookie) {
		return next(
			new AppError('You are not logged in! Please login to get access.', 401)
		);
	}

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		accessTokenAuthHeader = req.headers.authorization.split(' ')[1];
	}

	if (!accessTokenAuthHeader || accessTokenAuthHeader !== accessTokenCookie) {
		return next(
			new AppError('You are not logged in! Please login to get access.', 401)
		);
	}
	// 2) verify token

	// const decodedRefreshToken = await promisify(jsonWebtoken.verify)(
	//   refreshToken,
	//   process.env.REFRESH_TOKEN_SECRET
	// );

	jsonWebtoken.verify(
		accessTokenAuthHeader,
		process.env.ACCESS_TOKEN_SECRET,
		async (err, decodedAccessToken) => {
			if (err) {
				jsonWebtoken.verify(
					refreshToken,
					process.env.REFRESH_TOKEN_SECRET,
					async (err, decodedRefreshToken) => {
						if (err) {
							return next(
								new AppError(
									'You are not logged in! Please login to get access.',
									401
								)
							);
						}

						const currentUser = await User.findById(decodedRefreshToken.id);

						if (!currentUser) {
							return next(
								new AppError(
									'The user belongs to the token does no longer exist.',
									401
								)
							);
						}

						if (currentUser.changedPasswordAfter(decodedRefreshToken.iat)) {
							return next(
								new AppError(
									'User recently changed password! Please login again.',
									401
								)
							);
						}

						const accessToken = generateJwtToken('access', {
							_id: currentUser._id,
							name: currentUser.name,
							email: currentUser.email,
							photo: currentUser.photo,
							role: currentUser.role,
						});

						res.cookie('accessToken', accessToken, cookiesOption.access);

						req.userId = currentUser._id;
						next();
					}
				);
			} else {
				const currentUser = await User.findById(decodedAccessToken._id);

				if (!currentUser) {
					return next(
						new AppError(
							'The user belongs to the token does no longer exist.',
							401
						)
					);
				}

				if (currentUser.changedPasswordAfter(decodedAccessToken.iat)) {
					return next(
						new AppError(
							'User recently changed password! Please login again.',
							401
						)
					);
				}

				req.userId = currentUser._id;

				next();
			}
		}
	);
});

const restrictTo = (...roles) =>
	catchAsync(async (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new AppError('You do not have permission to perform this action', 403)
			);
		}

		next();
	});

// export const forgotPassword = catchAsync(async (req, res, next) => {
// 	// 1) Get user based on posted email
// 	const user = await User.findOne({ email: req.body.email });

// 	if (!user) {
// 		return next(new AppError('There is no user with email address.', 404));
// 	}

// 	// 2) Generate the random reset token
// 	const resetToken = user.createPasswordResetToken();
// 	await user.save({ validateBeforeSave: false });

// 	// 3) Send it to user's email
// 	const resetURL = `http://localhost:3000/resetPassword/${resetToken}`;
// 	// const resetURL = `${req.protocol}://${req.get(
// 	//   'host'
// 	// )}/api/v1/users/resetPassword/${resetToken}`;

// 	try {
// 		await new Email(user, resetURL).sendPasswordReset();

// 		res.status(200).json({
// 			status: 'success',
// 			message: 'Token sent to email!',
// 		});
// 	} catch (err) {
// 		user.passwordResetToken = undefined;
// 		user.passwordResetExpires = undefined;
// 		await user.save({ validateBeforeSave: false });

// 		return next(
// 			new AppError(
// 				'There was an error sending the email. Try again later!',
// 				500
// 			)
// 		);
// 	}
// });

// export const resetPassword = catchAsync(async (req, res, next) => {
// 	// 1) Get user based on the token

// 	const hashedToken = crypto
// 		.createHash('sha256')
// 		.update(req.params.token)
// 		.digest('hex');

// 	const user = await User.findOne({
// 		passwordResetToken: hashedToken,
// 		passwordResetExpires: { $gt: Date.now() },
// 	});

// 	// 2) If token has not expired, and there is user, set the new password
// 	if (!user) {
// 		return next(new AppError('Token is invalid or has expired', 400));
// 	}
// 	user.password = req.body.password;
// 	user.passwordConfirm = req.body.passwordConfirm;
// 	user.passwordResetToken = undefined;
// 	user.passwordResetExpires = undefined;
// 	await user.save();

// 	// 3) Update changedPasswordAt property for the user
// 	// 4) Log the user in, send JWT
// 	const refreshToken = generateJwtToken('refresh', {
// 		id: user.id,
// 	});

// 	createAndSendCookie(user, 200, res, 'refresh', refreshToken);
// 	createAndSendCookie(user, 200, res, 'access');
// 	// const token = generateJwtToken('refresh', {
// 	//   id: user.id,
// 	//   email: user.email,
// 	//   name: user.name,
// 	// });

// 	// res.status(200).json({
// 	//   status: 'success',
// 	//   token,
// 	// });
// });

// export const updatePassword = catchAsync(async (req, res, next) => {
// 	// 1) Get user from collection
// 	const user = await User.findById(req.user.id).select('+password');

// 	// 2) Check if POSTed current password is correct

// 	if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
// 		return next(new AppError('Your current password is wrong.', 401));
// 	}

// 	// 3) If so, update password
// 	user.password = req.body.password;
// 	user.passwordConfirm = req.body.passwordConfirm;
// 	await user.save();

// 	// 4) Log user in, send JWT
// 	createAndSendCookie(user, 200, res, 'access');

// 	//   id: user.id,
// 	//   email: user.email,
// 	//   name: user.name,
// 	// });

// 	// res.status(200).json({
// 	//   status: 'success',
// 	//   token,
// 	// });
// });

module.exports = {
	signUp,
	login,
	verifyOtp,
	logout,
	protect,
	restrictTo,
};
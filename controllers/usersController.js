const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');
const filterObj = require('../utils/filterObj');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
const generateJwtToken = require('../utils/generateJwtToken');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image')) {
		cb(null, true);
	} else {
		cb(new AppError('Not an image! Please upload only images.', 400), false);
	}
};

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
});

const uploadUserPhoto = upload.single('photo');

const resizeUserPhoto = (req, res, next) => {
	console.log('req.file', req.file);
	console.log('req.userId', req.userId);
	if (!req.file) return next();

	req.file.filename = `user-${req.userId}-${Date.now()}.jpeg`;

	sharp(req.file.buffer)
		.resize(500, 500)
		.toFormat('jpeg')
		.jpeg({ quality: 90 })
		.toFile(`public/img/users/${req.file.filename}`);

	next();
};
//Admin can get all users and can update,delete,get and create users

const getAllUsers = factory.getAll(User);
const getUser = factory.getOne(User);
//const createUser = factory.createOne(User, [
//   'name',
//   'email',
//   'password',
//   'role',
//   'passwordConfirm',
// ]);
const updateUser = factory.updateOne(User);
const deleteUser = factory.deleteOne(User);

//A user can update,delete and get his/her profile
const getMe = (req, res, next) => {
	req.params.id = req.userId;
	next();
};

const updateMe = catchAsync(async (req, res, next) => {
	// 1) Create error if user POSTs password data

	if (req.body.password || req.body.passwordConfirm) {
		return next(
			new AppError(
				'This route is not for password updates. Please use /updateMyPassword.',
				400
			)
		);
	}

	// 2) Filtered out unwanted fields names that are not allowed to be updated
	const filteredBody = filterObj(req.body, 'name', 'email');

	if (req.file) filteredBody.photo = req.file.filename;

	// 3) Update user document
	const updatedUser = await User.findByIdAndUpdate(req.userId, filteredBody, {
		new: true,
		runValidators: true,
	}).select('-active');

	const accessToken = generateJwtToken('access', {
		id: updatedUser._id,
		email: updatedUser.email,
		photo: updatedUser.photo,
		role: updatedUser.role,
		phone: updatedUser.phone,
		name: updatedUser.name,
		verified: updatedUser.verified,
	});

	res.json({
		accessToken,
	});
});

const deleteMe = catchAsync(async (req, res, next) => {
	const user = User.findById(req.user.id);
	if (!user.active) return next(new AppError('User already deleted', 404));

	await User.findByIdAndUpdate(req.user.id, {
		active: false,
	});

	res.status(204).json({
		status: 'success',
		data: null,
	});
});

module.exports = {
	getAllUsers,
	getUser,
	//createUser,
	updateUser,
	deleteUser,
	getMe,
	updateMe,
	deleteMe,
	uploadUserPhoto,
	resizeUserPhoto,
};

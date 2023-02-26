const Joi = require('@hapi/joi');
const { User } = require('../models/users');

const signUpValidation = (data) => {
	const schema = Joi.object({
		name: Joi.string().min(6).required(),
		email: Joi.string().min(6).required().email(),
		password: Joi.string().min(6).required(),
		phone: Joi.string().min(10).required(),
	});
	return schema.validate(data);
};

const loginValidation = (data) => {
	const schema = Joi.object({
		email: Joi.string().min(6).required().email(),
		password: Joi.string().min(6).required(),
	});
	return schema.validate(data);
};

module.exports.signUpValidation = signUpValidation;
module.exports.loginValidation = loginValidation;

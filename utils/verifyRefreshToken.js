const dotenv = require('dotenv');

dotenv.config();

const Token = require('../models/token');
const jwt = require('jsonwebtoken');
const jwtPublicKey = process.env.JWT_PUBLIC_KEY;

const verifyRefreshToken = async (refreshToken) => {
	return new Promise((resolve, reject) => {
		Token.findOne({ token: refreshToken }, (err, doc) => {
			if (!doc) return reject({ error: true, message: 'Invalid token' });
			jwt.verify(refreshToken, jwtPublicKey, (err, paylod) => {
				if (err) return reject({ error: true, message: 'Invalid token' });
				resolve({
					paylod,
					error: false,
					message: 'Token verified successfully',
				});
			});
		});
	});
};

module.exports = verifyRefreshToken;

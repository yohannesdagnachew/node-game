const dotenv = require('dotenv');

dotenv.config();

const jwtSecretKey = process.env.JWT_PRIVATE_KEY;
const jwtPublicKey = process.env.JWT_PUBLIC_KEY;
const jwt = require('jsonwebtoken');
const Token = require('../models/token');

const generateToken = async (user) => {
	try {
		const paylod = {
			_id: user._id,
			name: user.name,
		};
		const accessToken = jwt.sign(paylod, jwtSecretKey, { expiresIn: '15m' });
		const refreshToken = jwt.sign(paylod, jwtPublicKey, { expiresIn: '7d' });

		const userToken = await Token.findOneAndUpdate({ userId: user.id });
		if (userToken) await userToken.remove();
		const token = new Token({
			token: refreshToken,
			userId: user._id,
		}).save();
		return Promise.resolve({ accessToken, refreshToken });
	} catch (err) {
		return Promise.reject(err);
	}
};

module.exports = generateToken;

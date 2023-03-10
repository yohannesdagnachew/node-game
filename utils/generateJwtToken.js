const jwt = require('jsonwebtoken');

const generateJwtToken = (type, payload) => {
	if (type === 'access') {
		return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
			expiresIn: process.env.ACCESS_TOKEN_LIFE,
		});
	}

	if (type === 'refresh') {
		return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
			expiresIn: process.env.REFRESH_TOKEN_LIFE,
		});
	}

	return null;
};

module.exports = generateJwtToken;

const dotenv = require('dotenv');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

// client.messages
// 	.create({ body: 'Hi there', from: '+15017122661', to: '+15558675310' })
// 	.then((message) => console.log(message.sid));

dotenv.config();

class SMS {
	constructor(user) {
		this.to = user.phone;
		this.from = process.env.TWILIO_PHONE_NUMBER;
	}

	async send(body) {
		console.log(this.from, this.to, body);
		await client.messages.create({ body, from: this.from, to: this.to });
	}

	async sendOtp(otp) {
		await this.send(`Your Otp key (valid for only 3 minutes) ${otp}`);
	}
}

module.exports = SMS;

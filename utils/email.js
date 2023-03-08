const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');
const dotenv = require('dotenv');
const path = require('path');
const { fileURLToPath } = require('url');
dotenv.config();

class Email {
	constructor(user) {
		this.to = user.email;
		this.firstName = user.name.split(' ')[0];
		this.otp = '';
		this.url = '';
		this.password = '';
		this.from = `Node Game <${process.env.EMAIL_FROM}>`;
	}

	newTransport() {
		if (process.env.NODE_ENV === 'production') {
			return nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: process.env.GMAIL_USERNAME,
					pass: process.env.GMAIL_PASSWORD,
				},
			});
		}

		return nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: process.env.EMAIL_PORT,

			auth: {
				user: process.env.EMAIL_USERNAME,
				pass: process.env.EMAIL_PASSWORD,
			},
		});
	}

	async send(template, subject) {
		// 1) Render HTML based on a pug template
		const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
			firstName: this.firstName,
			otp: this.otp,
			url: this.url,
			subject,
		});

		// 2) Define email options
		const mailOptions = {
			from: this.from,
			to: this.to,
			subject,
			html,
			text: htmlToText(html),
		};

		// 3) Create a transport and send email
		await this.newTransport().sendMail(mailOptions);
	}

	async sendWelcome() {
		await this.send('welcome', 'Welcome to the Natours Family!');
	}

	async sendPasswordReset(url) {
		this.url = url;
		await this.send(
			'passwordReset',
			'Your password reset token (valid for only 10 minutes)'
		);
	}

	async sendOtp(otp) {
		this.otp = otp;
		await this.send(
			'otpVerification',
			'Your Otp key (valid for only 3 minutes)'
		);
	}

	async sendPassword(password) {
		this.password = password;
		await this.send(
			'password',
			'Your password to login using email, But you can login using your google account too.'
		);
	}
}

module.exports = Email;

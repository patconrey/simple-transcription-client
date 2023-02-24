const AWS = require('aws-sdk');
const verificationEmail = require('./../views/email/emailVerification');
const sessionConfirmationEmail = require('./../views/email/emailSessionConfirmation');

AWS.config.update({ region: 'us-west-2' });
if (process.env.NODE_ENV === 'development') {
	const credentials = new AWS.SharedIniFileCredentials({
		profile: 'default'
	});
	AWS.config.credentials = credentials
}

module.exports = class SESProvider {
	constructor() {
		return
	}

	sendSessionConfirmationEmail(userEmail, sessionIdToVerify) {
		let protocol = 'http';
		if (process.env.NODE_ENV === 'production') {
			protocol = 'https'
		}
		const confirmationUrl = `${protocol}://${process.env.REACT_APP_API_HOST}/confirm-session/${sessionIdToVerify}`;
		let message = sessionConfirmationEmail.htmlText;
		message = message.replace('<insert link>', confirmationUrl)

		const emailParams = {
			Destination: { 
				ToAddresses: [
					'pat@conreylabs.io',
				]
			},
			Message: {
				Body: {
					Html: {
						Charset: "UTF-8",
						Data: message
					},
				},
				Subject: {
					Charset: 'UTF-8',
					Data: 'Confirm your upcoming game session.'
				}
			},
			Source: 'no-reply@vokamancy.com',
			ReplyToAddresses: [
				'no-reply@vokamancy.com',
			],
		}

		return new AWS.SES({
				apiVersion: '2010-12-01'
			})
			.sendEmail(emailParams)
			.promise()
	}

	sendEmailVerificationEmail(user, verificationUrl) {
		const { firstName, lastName, email, isEmailVerified } = user

		if (isEmailVerified) {
			return;
		}

		if (!firstName || !lastName || !email) {
			throw new Error('Missing properties on user object.')
		}

		let message = verificationEmail.htmlText;
		message = message.replace('<insert link>', verificationUrl)

		const emailParams = {
			Destination: { 
				ToAddresses: [
					'pat@conreylabs.io',
				]
			},
			Message: {
				Body: {
					Html: {
						Charset: "UTF-8",
						Data: message
					},
				},
				Subject: {
					Charset: 'UTF-8',
					Data: 'Verify your Vokamancy account.'
				}
			},
			Source: 'no-reply@vokamancy.com',
			ReplyToAddresses: [
				'no-reply@vokamancy.com',
			],
		}

		return new AWS.SES({
				apiVersion: '2010-12-01'
			})
			.sendEmail(emailParams)
			.promise()
	}
}




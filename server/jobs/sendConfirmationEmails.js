const cron = require('node-cron');
const RecordingSession = require('../models/recordingSessionModel');
const SESProvider = require('./../utils/simpleEmailService');

const scheduleJob = () => {
	cron.schedule('*/5 * * * *', () => {
		const currentDate = new Date();
		const dateTwelveHoursFromNow = new Date();
		dateTwelveHoursFromNow.setHours( dateTwelveHoursFromNow.getHours() + 12 );

		RecordingSession.find({
			scheduledStartDate: {
				$gte: currentDate,
				$lte: dateTwelveHoursFromNow,
			},
			isConfirmationEmailSent: false,
			isConfirmed: false,
			isCanceled: false,
		}, function(err, docs) {
			console.log(`Found ${docs.length} documents.`)
			const emailProvider = new SESProvider()
			docs.map(session => {
				console.log(`Will send email to ${session.user.email} about confirming session ID: ${session._id}`);
				emailProvider.sendSessionConfirmationEmail(session.user.email, session._id)
					.then(() => {
						console.log('\tEmail successful')
						session.isConfirmationEmailSent = true
						session.save()
					})
			})
		})
		console.log(`should be running every 5 minutes ${new Date()}`)
	})
}

exports.sendConfirmationEmails = scheduleJob;

const mongoose = require('mongoose');
const User = require('./userModel');

const recordingSessionSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: [true, 'Recording session must belong to a user.']
	},
	scheduledStartDate: {
		type: Date, // ISO
		required: [true, 'Recording session must have an ISO start date.']
	},
	estimatedNumberOfPeople: {
		type: Number,
		required: [true, 'Recording session must supply an estimated number of people.']
	},
	duration: {
		type: Number,
		required: [true, 'Recording session must supply a duration.']
	},
	isConfirmed: {
		type: Boolean,
		default: false
	},
	isConfirmationEmailSent: {
		type: Boolean,
		default: false
	},
	hasSessionBegun: {
		type: Boolean,
		default: false
	},
	isCanceled: {
		type: Boolean,
		default: false
	},
});

recordingSessionSchema.pre(/^find/, function(next) {
	this.populate('user');
	next();
});

const RecordingSession = mongoose.model('RecordingSession', recordingSessionSchema);

module.exports = RecordingSession;

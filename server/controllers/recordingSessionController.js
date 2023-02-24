const RecordingSession = require('../models/recordingSessionModel');
const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');

exports.getAllRecordingSessionsForUser = factory.getAllForUser(RecordingSession);
exports.getAllRecordingSessions = factory.getAll(RecordingSession);
exports.getRecordingSession = factory.getOne(RecordingSession);
exports.createRecordingSession = factory.createOne(RecordingSession);
exports.updateRecordingSession = factory.updateOne(RecordingSession);
exports.deleteRecordingSession = factory.deleteOne(RecordingSession);

exports.confirmRecordingSession = catchAsync(async (req, res, next) => {
	const { sessionId } = req.params

	if (!sessionId) {
		return next(new AppError('Please provide the session ID.', 400));
	}

	const session = await RecordingSession.findOne({
		_id: sessionId
	});
	if (!session) {
		return next(new AppError('No recording session found with that id.', 404));
	}
	session.isConfirmed = true;
	await session.save({ validateBeforeSave: false });

	const redirectUrlBase = process.env.REACT_APP_HOME_HOST
	res.redirect(`http://${redirectUrlBase}/dashboard/`);
})
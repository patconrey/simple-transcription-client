const express = require('express');
const recordingSessionController = require('./../controllers/recordingSessionController');
const router = express.Router();

router.get('/:sessionId', recordingSessionController.confirmRecordingSession);

module.exports = router;
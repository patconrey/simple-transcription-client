const express = require('express');
const recordingSessionController = require('./../controllers/recordingSessionController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(
    recordingSessionController.getAllRecordingSessionsForUser)
  .post(
    authController.restrictTo('user', 'admin'),
    recordingSessionController.createRecordingSession
  );

router
    .route('/all')
    .get(
      authController.restrictTo('admin'),
      recordingSessionController.getAllRecordingSessions)

router
  .route('/:id')
  .get(recordingSessionController.getRecordingSession)
  .patch(
    authController.restrictTo('user', 'admin'),
    recordingSessionController.updateRecordingSession
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    recordingSessionController.deleteRecordingSession
  );

module.exports = router;

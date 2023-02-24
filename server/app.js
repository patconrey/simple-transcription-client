const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const recordingSessionRouter = require('./routes/recordingSessionRoutes');
const verificationRouter = require('./routes/verificationRoutes');
const recordingSessionConfirmationRouter = require('./routes/recordingSessionConfirmationRoutes');

// Start express app
const app = express();

app.enable('trust proxy');

app.use(express.static(path.join(__dirname, '../client/build')))
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(cors({
  origin: '*',
  credentials: true
}));
app.options('*', cors());

// app.use(helmet.contentSecurityPolicy({
//   directives: {
//       'script-src-attr': null
//   },
//   connectSrc: ['wss://data.vokamancy.com', 'ws://data.vokamancy.com'],
//   workerSrc: ['self']
// }));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.get('/status', (req, res) => {
  res.sendStatus(200)
})
app.use('/api/v1/users', userRouter);
app.use('/api/v1/recording-sessions', recordingSessionRouter);
app.use('/verify', verificationRouter);
app.use('/confirm-session', recordingSessionConfirmationRouter)

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.use(globalErrorHandler);

module.exports = app;

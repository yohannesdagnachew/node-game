const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const xss = require('xss-clean');
// const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');

const userRouter = require('./routes/userRouter');
const questionRouter = require('./routes/questionRouter');
const gameRouter = require('./routes/gameRoute');

const AppError = require('./utils/appError');

const errorController = require('./controllers/errorController');
const corsOptions = require('./config/corsOptions');
const path = require('path');
const { fileURLToPath } = require('url');

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

errorController.unCaughtException();

// const corsOptions = {
// 	origin: [
// 		'https://lambent-maamoul-6d6af3.netlify.app/',
// 		'http://localhost:3000',
// 		'http://localhost:3001',
// 		'http://localhost:3002',
// 		undefined,
// 	],
// 	optionSuccessStatus: 200,
// 	credentials: true,
// };

const app = express();
app.enable('trust proxy');
// 1) GLOBAL MIDDLEWARES

app.use(cors(corsOptions));
// app.options('*', cors());

// serving static files
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/build')));

// Set security HTTP headers
app.use(helmet());

// Development logging
// if (process.env.NODE_ENV === 'development') {
app.use(morgan('dev'));
// }

// Limit requests from same API
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000,
	message: 'Too many requests from this IP, please try again in an hour!',
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
// app.use(
//   hpp({
//     whitelist: [
// white list the query parameters that you want to allow to be duplicated
//     ],
//   })
// );

// Routes middleware

app.use('/api/users', userRouter);
app.use('/api/question', questionRouter);
app.use('/api/game', gameRouter);

//4) Unhandled routes
app.all('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`));
});

//5) Global error handler
app.use(errorController.globalErrorHandler);

module.exports = app;

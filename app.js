import express from 'express';
import authRoutes from './routes/authRoutes.js';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';

import globalErrorHandler from './controllers/errorController.js';
import AppError from './utils/appError.js';
import projectRoutes from './routes/projectRoutes.js';
import calenderRoutes from './routes/calenderRoutes.js';
import demoRoutes from './routes/demoRoutes.js';

const app = express();
app.use(helmet());
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
//You this to affect only the /api routes

const allowedOrigins = [
  'https://traverse-eight.vercel.app',
  'http://localhost:3000'
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());
app.get('/', (req, res) => {
  res.send('welcome to TraverseBE');
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/project', projectRoutes);
app.use('/api/v1/calendar', calenderRoutes);
app.use('/api/v1/request', demoRoutes);
app.use('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);
export default app;

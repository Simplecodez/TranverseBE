import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';

import authRoutes from './src/routes/authRoutes.js';
import globalErrorHandler from './src/controllers/errorController.js';
import AppError from './src/utils/appError.js';
import projectRoutes from './src/features/project/routes/project-routes.js';
import calenderRoutes from './src/routes/calenderRoutes.js';
import demoRoutes from './src/routes/demoRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import commentRoutes from './src/routes/commentRoutes.js';
import initSocket from './src/features/chat/socket.js';

const app = express();

const allowedOrigins = ['https://traversemob.vercel.app', 'http://localhost:3000', `${process.env.FE_URL}`];

const server = http.createServer(app, {
  cors: {
    origin: allowedOrigins
  }
});

initSocket(server);

app.use(helmet());
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});

const corsOptions = {
  origin: allowedOrigins,
  credentials: true
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(compression());

app.get('/', (req, res) => {
  res.send('welcome to TraverseBE');
});
// const currentDir = path.dirname(fileURLToPath(import.meta.url));
// app.use('/:id/download', protect, express.static(path.join(currentDir, `/public/project/${req.params.id}`)));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/project', projectRoutes);
app.use('/api/v1/calendar', calenderRoutes);
app.use('/api/v1/request', demoRoutes);
app.use('/api/v1/notification', notificationRoutes);
app.use('/api/v1/comment', commentRoutes.initRoutes());
app.use('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);

export default server;

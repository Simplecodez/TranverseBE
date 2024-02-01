import express from 'express';
import authRoutes from './routes/authRoutes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './controllers/errorController.js';
import AppError from './utils/appError.js';
import projectRoutes from './routes/projectRoutes.js'

const app = express();
const port = 5000;
const allowedOrigins = [
  'https://edtechdev.vercel.app',
  'http://localhost:3000'
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('welcome to TraverseBE');
});


app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/project', projectRoutes);
app.use('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);
export default app;

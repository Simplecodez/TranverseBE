import AppError from '../utils/appError.js';

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

const handleDuplicateDB = (err) => {
  const message = `Email already exists, please use another one.`;
  return new AppError(message, 400);
};

const handleValidationErrorDb = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.map((error, i) => `${i + 1}) ${error}`).join('. ')}`;
  return new AppError(message, 400);
};

const sendError = (err, req, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      type: err.type,
      message: err.message
    });
  }

  // Log the error
  console.error('error', err);
  // Send generic message.
  return res.status(500).json({
    status: 'error',
    message: 'Something went very wrong!'
  });
};
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  let error = err;

  if (error.code === 11000) error = handleDuplicateDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDb(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
  sendError(error, req, res);
};

export default errorHandler;

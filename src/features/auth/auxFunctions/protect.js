import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import User from '../../../models/userModel.js';
import AppError from '../../../utils/appError.js';

const protectAux = async (token, next) => {
  if (!token) {
    return next(
      new AppError('Your are not logged in! Please log in to get access.', 401)
    );
  }
  // verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        'This account no longer has access, please create a new account to gain access.',
        401
      )
    );
  }

  if (freshUser.active === false)
    return next(new AppError('Please activate your account to continue.', 401));

  // check if user changed password after the token issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  return freshUser;
};

export default protectAux;

import crypto from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import User from '../../../models/userModel.js';
import catchAsync from '../../../utils/catchAsync.js';
import Email from '../../../utils/email.js';
import AppError from '../../../utils/appError.js';
import { createSendToken } from '../../../utils/jwt.utils.js';
import { licenceNumberGenerator } from '../../../utils/helperFun.js';
import protectAux from '../auxFunctions/protect.js';
import { Stats } from 'fs';

const signup = catchAsync(async (req, res, next) => {
  const { licence, hashedLicence } = licenceNumberGenerator();
  const { name, email, companyName, website, password, passwordConfirm, stack } = req.body;

  const newUser = {
    name,
    email,
    companyName,
    website,
    password,
    passwordConfirm,
    stack
  };
  newUser.licence = hashedLicence;
  const user = await User.create(newUser);

  try {
    await new Email(user).sendWelcome(licence);
    return res.status(201).json({
      status: 'success',
      message: 'Signup successful, kindly check your email for your Licence Number.'
    });
  } catch (err) {
    await User.deleteOne({ email: req.body.email });
    return next(err);
  }
});

const activateAccount = catchAsync(async (req, res, next) => {
  const hashedLicence = crypto.createHash('sha256').update(req.body.licence).digest('hex');
  const user = await User.findOne({
    licence: hashedLicence
  });
  if (!user) {
    return next(new AppError('Invalid Licence Number', 400));
  }
  if (user.active) return next(new AppError('Account already activated.'));
  console.log(user);
  user.active = true;
  await user.save();
  res.status(200).json({ Stats: 200, message: 'Account activated succesfully.' });
});

const signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(`Incorrect email or password.`, 401));
  }
  if (user && (await user.correctPassword(password, user.password))) {
    if (!user.active) {
      return next(new AppError(`You have not activated your account. Please do so to gain access.`, 401));
    }
  }
  createSendToken(user, 200, 'Signed in successfully.', req, res);
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin','user' 'team-lead']. role = 'user'
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do have permission to perform this action!', 403));
    }
    next();
  };
};

const protect = catchAsync(async (req, res, next) => {
  // get token and check if it exist
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log(token);
  //Attach the fresh user to the request

  req.user = await protectAux(token, next);
  next();
});

const getMe = (req, res) => {
  res.status(200).json({
    status: 'success',
    user: req.user
  });
};

const signout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

const forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on posted email
  if (!req.body.email) {
    return next(new AppError('You need to provide an email to continue!', 401));
  }
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('User does not exist!', 404));
  }
  // 2. Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3. Send it to user's email
  const resetURL = `${process.env.FE_URL}/auth/reset?token=${resetToken}`;

  try {
    await new Email({
      name: 'Candidate',
      email: req.body.email
    }).sendResetToken(resetURL);

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) if token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  if (user.password !== user.passwordConfirm) return next(new AppError('Passwords are not the same', 400));
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changePasswordAt property for the user
  // 4) Log in the user in, send JWT
  createSendToken(user, 200, ' Password reset was successful.', req, res);
});

export { signup, signin, activateAccount, protect, restrictTo, signout, forgotPassword, resetPassword, getMe };

import crypto from 'crypto';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import Email from '../utils/email.js';
import AppError from '../utils/appError.js';
import { createSendToken } from '../utils/jwt.utils.js';
import { licenceNumberGenerator } from '../utils/helperFun.js';


const signup = catchAsync(async (req, res, next) => {

  const { licence, hashedLicence } = licenceNumberGenerator();
  const {name, email,companyName, website, password, passwordConfirm} = req.body

  const newUser = {
    name,
    email,
    companyName,
    website,
    password,
    passwordConfirm
  };
  newUser.licence = hashedLicence;
  const user = await User.create(newUser);

  try {
    await new Email(user).sendWelcome(licence);
    return res.status(201).json({
      status: 'success',
      message:
        'Signup successful, kindly check your email for your Licence Number.'
    });
  } catch (err) {
    await User.deleteOne({ email: req.body.email });
    return next(err);
  }
});

const activateAccount = catchAsync(async (req, res, next) => {
  const hashedLicence = crypto
    .createHash('sha256')
    .update(req.body.licence)
    .digest('hex');
  const user = await User.findOne({
    licence: hashedLicence
  });
  if (!user) {
    return next(new AppError('Invalid Licence Number', 400));
  }
  user.active = true;
  await user.save({ validateBeforeSave: false });
  createSendToken(user, 200, 'Account activated successfully.', req, res);
});

const signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  const user = await User.findOne({ email }).select(
    '+password -__v +active'
  );
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(`Incorrect email or password.`, 401));
  }
  if (user && (await user.correctPassword(password, user.password))) {
    if (!user.active) {
      return next(
        new AppError(
          `You have not activated your account. Please do so to gain access.`,
          401
        )
      );
    }
  }
  createSendToken(user, 200, 'Signed in successfully.', req, res);
});

export { signup, signin, activateAccount };

import crypto from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import Email from '../utils/email.js';
import AppError from '../utils/appError.js';
import { createSendToken } from '../utils/jwt.utils.js';
import { licenceNumberGenerator } from '../utils/helperFun.js';

const signup = catchAsync(async (req, res, next) => {
  const { licence, hashedLicence } = licenceNumberGenerator();
  const { name, email, companyName, website, password, passwordConfirm } =
    req.body;

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
  const user = await User.findOne({ email }).select('+password -__v +active');
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

const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin','user' 'team-lead']. role = 'user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do have permission to perform this action!', 403)
      );
    }
    next();
  };
};

const protect = catchAsync(async (req, res, next) => {
  // get token and check if it exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
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

  //Grant access to protected route
  req.user = freshUser;
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
  const resetURL = `https://traversemob.vercel.app/auth/reset?token=${resetToken}`;

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
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
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
  if (user.password !== user.passwordConfirm)
    return next(new AppError('Passwords are not the same', 400));
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changePasswordAt property for the user
  // 4) Log in the user in, send JWT
  createSendToken(user, 200, ' Password reset was successful.', req, res);
});

const updateAccount = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');
  const { companyName, passwordCurrent, password, passwordConfirm } = req.body;
  const fieldsAllowed = [
    'companyName',
    'password',
    'passwordConfirm',
    'passwordCurrent'
  ];
  const postedFields = Object.keys(req.body);
  const invalidFields = postedFields.filter(
    (element) => !fieldsAllowed.includes(element)
  );

  if (invalidFields.length > 0)
    return next(
      new AppError(
        `You are not allowed to update the field(s): '${invalidFields.join(
          ', '
        )}'.`,
        400
      )
    );

  if (password) {
    if (!passwordConfirm) {
      return next(new AppError('Please confirm your password!', 400));
    }
    if (!passwordCurrent) {
      return next(new AppError('Please provide your current password!', 400));
    }
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return next(new AppError('Your current password is wrong.', 401));
    }
    user.password = password;
    user.passwordConfirm = passwordConfirm;
  }

  if (companyName) {
    user.companyName = companyName;
  }

  await user.save();

  createSendToken(
    user,
    200,
    'Your account was updated successfully.',
    req,
    res
  );
});

export {
  signup,
  signin,
  activateAccount,
  protect,
  restrictTo,
  signout,
  forgotPassword,
  resetPassword,
  getMe,
  updateAccount
};

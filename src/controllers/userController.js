'use strict';
import multer from 'multer';
import sharp from 'sharp';
import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { createSendToken } from '../utils/jwt.utils.js';

const userSearch = catchAsync(async (req, res, next) => {
  const { query } = req.body;
  let users = [];
  if (query.length >= 3) {
    // Search function by name or email
    users = await User.find({
      $or: [{ name: { $regex: query, $options: 'i' } }, { email: { $regex: query, $options: 'i' } }]
    });
  }
  res.status(200).json({
    status: 'success',
    count: users.length,
    users
  });
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

const uploadUserPhoto = upload.single('photo');

const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize({
      width: 400,
      height: 400,
      fit: 'cover'
    })
    .toFormat('jpeg')
    .jpeg({ quality: 100 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

const updateAccount = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');
  const { companyName, passwordCurrent, password, passwordConfirm, bio, stack, photoURL } = req.body;
  const fieldsAllowed = ['companyName', 'password', 'passwordConfirm', 'passwordCurrent', 'bio', 'photoURL', 'stack'];
  const postedFields = Object.keys(req.body);
  const invalidFields = postedFields.filter((element) => !fieldsAllowed.includes(element));

  if (invalidFields.length > 0)
    return next(new AppError(`You are not allowed to update the field(s): '${invalidFields.join(', ')}'.`, 400));

  if (password) {
    if (!passwordConfirm) {
      return next(new AppError('Please confirm your password!', 400));
    }
    if (!passwordCurrent) {
      return next(new AppError('Please provide your current password!', 400));
    }
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
      return next(new AppError('Your current password is wrong.', 401));
    }
    user.password = password;
    user.passwordConfirm = passwordConfirm;
  }

  if (companyName) {
    user.companyName = companyName;
  }

  if (photoURL) user.photo = photoURL;

  if (bio) user.bio = bio;

  if (stack) user.stack = stack;

  await user.save();

  createSendToken(user, 200, 'Your account was updated successfully.', req, res);
});

export { userSearch, uploadUserPhoto, resizeUserPhoto, updateAccount };

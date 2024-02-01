import jwt from 'jsonwebtoken';

const signToken = (id, expiresin) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: expiresin
  });
};

// refactored the feedback
const createSendToken = (user, statusCode, message, req, res) => {
  const token = signToken(user._id, process.env.JWT_EXPIRES_IN);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None'
  });
  // removes the password from the output
  delete user._doc.password;
  delete user._doc.active;
  res.status(statusCode).json({
    status: 'success',
    message,
    data: {
      user
    }
  });
};

export { createSendToken };

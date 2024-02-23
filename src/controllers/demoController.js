import Demo from '../models/demoModel.js';
import catchAsync from '../utils/catchAsync.js';
import Email from '../utils/email.js';

const createDemo = catchAsync(async (req, res, next) => {
  const { name, email, message } = req.body;
  const request = await Demo.create({ name, email, message });
  try {
    await new Email(request).sendRequest();
    return res.status(201).json({
      status: 'success',
      message: 'Request has been submitted successfully.'
    });
  } catch (err) {
    await Demo.deleteOne({ email: req.body.email });
    return next(err);
  }
});

export { createDemo };

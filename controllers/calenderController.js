import User from "../models/userModel.js";
import Calender from "../models/calenderModel.js";
import catchAsyn from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

//@desc Get calender data
//@route GET api/v1/calender
//@access Private

const getCalenderData = catchAsyn(async (req, res) => {
    const events = await Calender.find({ user: req.user.id });
    res.status(200).json({
        status: "success",
        events
    });
 
});

const getOne = catchAsyn(async (req, res) => {
  const event = await Calender.findOne({ user: req.user.id, _id: req.params.id });
  res.status(200).json({
      status: "success",
      event
  });

});

//@desc  Add new event to the calendar
//@route POST api/v1/calender/
//@access Private

const newCalender = catchAsyn(async (req, res, next) => {
  const { event, time, day, month, year } = req.body;
  if ( !event || !time || !day || !month || !year) {
    return next(new AppError('Please provide all fields', 400))
  }

  const calender = await Calender.create({
    user: req.user.id,
    event: req.body.event,
    time: req.body.time,
    day: req.body.day,
    month: req.body.month,
    year: req.body.year,
  });
  res.status(200).json({
    status:"success",
    event: calender
  });
});

//checking if user is authorized
/*
if (calender.user.toString() !== req.user.id) {
    return res.status(401).json({msg: "User not authorized"});
}
*/

export { getCalenderData, newCalender, getOne};
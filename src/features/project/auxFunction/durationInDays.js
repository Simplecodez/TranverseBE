const durationInDaysFunc = (startDate, endDate) => {
  const mongoStartDate = new Date(startDate);
  const mongoEndDate = new Date(endDate);
  const durationInMilliseconds = mongoEndDate - mongoStartDate;

  if (durationInMilliseconds < 0)
    throw new AppError('Sorry, Start date cannot be later than End date!', 400);

  return {
    durationInDays: durationInMilliseconds / (1000 * 60 * 60 * 24),
    mongoStartDate,
    mongoEndDate
  };
};

export default durationInDaysFunc;

import crypto from 'crypto';
import otpGenerator from 'otp-generator';
// import AppError from './appError';

const licenceNumberGenerator = () => {
  const licence = otpGenerator.generate(6, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false
  });
  const hashedLicence = crypto
    .createHash('sha256')
    .update(licence)
    .digest('hex');

  return { licence, hashedLicence };
};

const emailingPromise = async (
  Project,
  url,
  teamMembers,
  project,
  action,
  Email
) => {
  try {
    const emailPromise = teamMembers.map((email) => {
      return new Email(project).sendProjectCreated(
        email,
        project.title,
        url,
        'Invitation for Collaboration.'
      );
    });
    const userProjectPromise = new Email(project).sendUserProject(
      `You have successfully sent invite for ${project.title} project.`,
      'Invites success!'
    );
    const totalPromise = [...emailPromise, userProjectPromise];
    await Promise.all(totalPromise);
    return 'email sent';
  } catch (err) {
    if (action === 'create') await Project.deleteOne({ _id: project._id });
    throw err;
  }
};

export { licenceNumberGenerator, emailingPromise };

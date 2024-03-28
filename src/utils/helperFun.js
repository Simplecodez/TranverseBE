import crypto from 'crypto';
import otpGenerator from 'otp-generator';
import Project from '../models/projectModel.js';
import Email from './email.js';
// import AppError from './appError';

const licenceNumberGenerator = () => {
  const licence = otpGenerator.generate(6, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false
  });
  const hashedLicence = crypto.createHash('sha256').update(licence).digest('hex');

  return { licence, hashedLicence };
};

const emailingPromise = async (url, teamMembers, project, action) => {
  try {
    if (teamMembers.length > 0) {
      const emailPromise = teamMembers.map((email) => {
        return new Email(project).sendProjectCreated(email, project.title, url, 'Invitation for Collaboration.');
      });
      const userProjectPromise = new Email(project).sendUserProject(
        `You have successfully ${action === 'create' ? 'created and ' : ''} sent invite for ${project.title} project.`,
        'Invites success!'
      );
      const totalPromise = [...emailPromise, userProjectPromise];
      await Promise.all(totalPromise);
      return;
    }

    if (teamMembers.length <= 0 && action === 'create') {
      await new Email(project).sendUserProject(`You have successfully created ${project.title} project.`, '');
      return;
    }
  } catch (err) {
    if (action === 'create') await Project.deleteOne({ _id: project._id });
    throw err;
  }
};

export { licenceNumberGenerator, emailingPromise };
